
import { Stack, router } from 'expo-router';
import DocumentItem from '@/components/DocumentItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Company, F24, Document } from '@/types';
import F24Card from '@/components/F24Card';
import { IconSymbol } from '@/components/IconSymbol';
import { supabaseService } from '@/services/supabaseService';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';

type TabType = 'f24' | 'documenti';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  accountButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.secondary + '30',
  },
  companySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  companySelectorText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    backgroundColor: colors.error + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default function HomeScreen() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<TabType>('f24');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [f24List, setF24List] = useState<F24[]>([]);
  const [documentList, setDocumentList] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      console.log('No user found');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading companies for user:', user.idCliente);
      
      const userCompanies = await supabaseService.getCompaniesByClientId(user.idCliente);
      console.log('Loaded companies:', userCompanies.length);
      
      setCompanies(userCompanies);
      
      if (userCompanies.length > 0) {
        setSelectedCompany(userCompanies[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Errore', 'Impossibile caricare i dati');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadCompanyData = useCallback(async () => {
    if (!selectedCompany) return;

    try {
      setLoadingData(true);
      console.log('Loading data for company:', selectedCompany.partitaIva);

      const [f24s, documents] = await Promise.all([
        supabaseService.getF24sByPiva(selectedCompany.partitaIva),
        supabaseService.getDocumentsByPiva(selectedCompany.partitaIva),
      ]);

      console.log('Loaded F24s:', f24s.length);
      console.log('Loaded documents:', documents.length);

      setF24List(f24s);
      setDocumentList(documents);
    } catch (error) {
      console.error('Error loading company data:', error);
      Alert.alert('Errore', 'Impossibile caricare i dati dell\'azienda');
    } finally {
      setLoadingData(false);
    }
  }, [selectedCompany]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedCompany) {
      loadCompanyData();
    }
  }, [loadCompanyData, selectedCompany]);

  const handleUpdateF24 = async (id: string, updates: Partial<F24>) => {
    try {
      console.log('Updating F24:', id, updates);
      
      await supabaseService.updateF24Status(
        id,
        updates.stato!,
        updates.importoPagato
      );

      // Reload data
      await loadCompanyData();
      
      Alert.alert('Successo', 'Stato F24 aggiornato correttamente');
    } catch (error) {
      console.error('Error updating F24:', error);
      Alert.alert('Errore', 'Impossibile aggiornare lo stato F24');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (companies.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <IconSymbol name="business" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            Nessuna azienda associata.{'\n'}Vai alle impostazioni per associare una P.IVA.
          </Text>
          <TouchableOpacity
            style={{ marginTop: 24, padding: 12, backgroundColor: colors.primary, borderRadius: 8 }}
            onPress={() => router.push('/account-management')}
          >
            <Text style={{ color: colors.secondary, fontWeight: '600' }}>Gestione Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Image
              source={require('@/assets/images/c64fce72-61c9-461d-ae06-0380f4682de5.jpeg')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Telematica E Servizi</Text>
          </View>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={() => router.push('/account-management')}
          >
            <IconSymbol name="settings" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.companySelector}
          onPress={() => {
            // Show company picker
            Alert.alert(
              'Seleziona Azienda',
              '',
              companies.map(company => ({
                text: company.denominazione,
                onPress: () => setSelectedCompany(company),
              }))
            );
          }}
        >
          <IconSymbol name="business" size={20} color={colors.primary} />
          <Text style={styles.companySelectorText}>
            {selectedCompany?.denominazione || 'Seleziona azienda'}
          </Text>
          <IconSymbol name="chevron-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'f24' && styles.tabActive]}
          onPress={() => setSelectedTab('f24')}
        >
          <Text style={[styles.tabText, selectedTab === 'f24' && styles.tabTextActive]}>
            F24
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'documenti' && styles.tabActive]}
          onPress={() => setSelectedTab('documenti')}
        >
          <Text style={[styles.tabText, selectedTab === 'documenti' && styles.tabTextActive]}>
            Documenti
          </Text>
        </TouchableOpacity>
      </View>

      {loadingData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Caricamento dati...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {selectedTab === 'f24' ? (
            f24List.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="description" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>
                  Nessun F24 disponibile per questa azienda
                </Text>
              </View>
            ) : (
              f24List.map((f24) => (
                <F24Card key={f24.idF24} f24={f24} onUpdate={handleUpdateF24} />
              ))
            )
          ) : (
            documentList.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="folder" size={64} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>
                  Nessun documento disponibile per questa azienda
                </Text>
              </View>
            ) : (
              documentList.map((doc) => (
                <DocumentItem key={doc.idDocumento} document={doc} />
              ))
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
