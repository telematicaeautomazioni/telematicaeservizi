
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { Company, F24, Document } from '@/types';
import F24Card from '@/components/F24Card';
import DocumentItem from '@/components/DocumentItem';
import { IconSymbol } from '@/components/IconSymbol';
import { googleSheetsService } from '@/services/googleSheetsService';

type TabType = 'f24' | 'documents';

export default function HomeScreen() {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [f24List, setF24List] = useState<F24[]>([]);
  const [documentList, setDocumentList] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('f24');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      router.replace('/login');
      return;
    }

    loadData();
  }, [user]);

  useEffect(() => {
    if (selectedCompany) {
      loadCompanyData();
    }
  }, [selectedCompany]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Loading companies for user:', user.idCliente);

      // Carica le aziende associate all'utente
      const userCompanies = await googleSheetsService.getCompaniesByClientId(user.idCliente);
      console.log('Loaded companies:', userCompanies.length);

      setCompanies(userCompanies);

      if (userCompanies.length > 0) {
        setSelectedCompany(userCompanies[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Errore', 'Impossibile caricare i dati. Verifica la connessione a Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyData = async () => {
    if (!selectedCompany) return;

    try {
      setRefreshing(true);
      console.log('Loading data for company:', selectedCompany.partitaIva);

      // Carica F24 e documenti per l'azienda selezionata
      const [f24s, documents] = await Promise.all([
        googleSheetsService.getF24sByPiva(selectedCompany.partitaIva),
        googleSheetsService.getDocumentsByPiva(selectedCompany.partitaIva),
      ]);

      console.log('Loaded F24s:', f24s.length, 'Documents:', documents.length);

      setF24List(f24s);
      setDocumentList(documents);
    } catch (error) {
      console.error('Error loading company data:', error);
      Alert.alert('Errore', 'Impossibile caricare i dati dell\'azienda.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateF24 = async (id: string, updates: Partial<F24>) => {
    try {
      console.log('Updating F24:', id, updates);

      // Aggiorna lo stato locale immediatamente per una UX migliore
      setF24List((prev) =>
        prev.map((f24) => (f24.idF24 === id ? { ...f24, ...updates } : f24))
      );

      // Aggiorna su Google Sheets
      if (updates.stato) {
        await googleSheetsService.updateF24Status(
          id,
          updates.stato,
          updates.importoPagato
        );
        console.log('F24 updated successfully');
      }
    } catch (error) {
      console.error('Error updating F24:', error);
      Alert.alert('Errore', 'Impossibile aggiornare lo stato dell\'F24.');
      // Ricarica i dati in caso di errore
      await loadCompanyData();
    }
  };

  const filteredF24s = f24List;
  const filteredDocuments = documentList;

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Caricamento dati da Google Sheets...</Text>
      </View>
    );
  }

  if (companies.length === 0) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Dashboard',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push('/account-management')}
                style={styles.headerButton}
              >
                <IconSymbol name="person.circle" size={28} color={colors.primary} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.emptyState}>
          <IconSymbol name="building.2" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Nessuna Azienda Associata</Text>
          <Text style={styles.emptyText}>
            Associa una Partita IVA per visualizzare i documenti
          </Text>
          <TouchableOpacity
            style={styles.associateButton}
            onPress={() => router.push('/associate-piva')}
          >
            <Text style={styles.associateButtonText}>Associa P.IVA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Dashboard',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/account-management')}
              style={styles.headerButton}
            >
              <IconSymbol name="person.circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.header}>
        <Text style={styles.welcomeText}>Benvenuto, {user?.nomeCompleto}</Text>

        <TouchableOpacity
          style={styles.companySelector}
          onPress={() => setShowCompanyDropdown(!showCompanyDropdown)}
        >
          <View style={styles.companySelectorContent}>
            <IconSymbol name="building.2" size={20} color={colors.primary} />
            <Text style={styles.companySelectorText}>
              {selectedCompany?.denominazione || 'Seleziona azienda'}
            </Text>
          </View>
          <IconSymbol
            name={showCompanyDropdown ? 'chevron.up' : 'chevron.down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {showCompanyDropdown && (
          <View style={styles.dropdown}>
            {companies.map((company) => (
              <TouchableOpacity
                key={company.idAzienda}
                style={[
                  styles.dropdownItem,
                  selectedCompany?.idAzienda === company.idAzienda &&
                    styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedCompany(company);
                  setShowCompanyDropdown(false);
                  console.log('Selected company:', company.denominazione);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedCompany?.idAzienda === company.idAzienda &&
                      styles.dropdownItemTextActive,
                  ]}
                >
                  {company.denominazione}
                </Text>
                <Text style={styles.dropdownItemSubtext}>
                  P.IVA: {company.partitaIva}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'f24' && styles.tabActive]}
          onPress={() => setActiveTab('f24')}
        >
          <IconSymbol
            name="doc.text"
            size={20}
            color={activeTab === 'f24' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'f24' && styles.tabTextActive,
            ]}
          >
            F24
          </Text>
          {filteredF24s.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filteredF24s.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'documents' && styles.tabActive]}
          onPress={() => setActiveTab('documents')}
        >
          <IconSymbol
            name="folder"
            size={20}
            color={activeTab === 'documents' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'documents' && styles.tabTextActive,
            ]}
          >
            Documenti
          </Text>
          {filteredDocuments.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filteredDocuments.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {refreshing ? (
        <View style={styles.refreshingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.refreshingText}>Aggiornamento...</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
        ]}
      >
        {activeTab === 'f24' ? (
          <>
            {filteredF24s.length === 0 ? (
              <View style={styles.emptyTabState}>
                <IconSymbol name="doc.text" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyTabText}>Nessun F24 disponibile</Text>
              </View>
            ) : (
              filteredF24s.map((f24) => (
                <F24Card key={f24.idF24} f24={f24} onUpdate={handleUpdateF24} />
              ))
            )}
          </>
        ) : (
          <>
            {filteredDocuments.length === 0 ? (
              <View style={styles.emptyTabState}>
                <IconSymbol name="folder" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyTabText}>Nessun documento disponibile</Text>
              </View>
            ) : (
              filteredDocuments.map((doc) => (
                <DocumentItem key={doc.idDocumento} document={doc} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  refreshingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: colors.highlight,
    gap: 8,
  },
  refreshingText: {
    fontSize: 14,
    color: colors.text,
  },
  header: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  companySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  companySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  companySelectorText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemActive: {
    backgroundColor: colors.highlight,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  dropdownItemTextActive: {
    color: colors.primary,
  },
  dropdownItemSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  associateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  associateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  emptyTabState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTabText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  headerButton: {
    padding: 8,
  },
});
