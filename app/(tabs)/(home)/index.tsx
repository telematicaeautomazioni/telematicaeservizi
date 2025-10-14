
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
import { mockCompanies, mockF24s, mockDocuments } from '@/data/mockData';
import { Company, F24, Document } from '@/types';
import F24Card from '@/components/F24Card';
import DocumentItem from '@/components/DocumentItem';
import { IconSymbol } from '@/components/IconSymbol';

type TabType = 'f24' | 'documents';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [f24List, setF24List] = useState<F24[]>(mockF24s);
  const [documentList] = useState<Document[]>(mockDocuments);
  const [activeTab, setActiveTab] = useState<TabType>('f24');
  const [loading, setLoading] = useState(true);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      router.replace('/login');
      return;
    }

    // Load user's companies
    const userCompanies = mockCompanies.filter(
      (c) => c.idClienteAssociato === user.idCliente
    );

    console.log('Loaded companies for user:', userCompanies.length);
    setCompanies(userCompanies);

    if (userCompanies.length > 0) {
      setSelectedCompany(userCompanies[0]);
    }

    setLoading(false);
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Sei sicuro di voler uscire?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleUpdateF24 = (id: string, updates: Partial<F24>) => {
    setF24List((prev) =>
      prev.map((f24) => (f24.idF24 === id ? { ...f24, ...updates } : f24))
    );
  };

  const filteredF24s = selectedCompany
    ? f24List.filter((f24) => f24.partitaIvaAzienda === selectedCompany.partitaIva)
    : [];

  const filteredDocuments = selectedCompany
    ? documentList.filter((doc) => doc.partitaIvaAzienda === selectedCompany.partitaIva)
    : [];

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (companies.length === 0) {
    return (
      <SafeAreaView style={commonStyles.container}>
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
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={colors.error} />
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
  logoutButton: {
    padding: 8,
  },
});
