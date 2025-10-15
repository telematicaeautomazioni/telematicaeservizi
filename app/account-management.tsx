
import { Company } from '@/types';
import { supabaseService } from '@/services/supabaseService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

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
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  userInfoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userInfoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  userTypeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  addButton: {
    ...buttonStyles.primary,
  },
  addButtonText: {
    ...buttonStyles.primaryText,
  },
  companiesList: {
    marginTop: 8,
  },
  companyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  companyInfo: {
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  companyPiva: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.error + '20',
  },
  logoutButton: {
    ...buttonStyles.secondary,
    backgroundColor: colors.error,
    marginTop: 24,
  },
  logoutButtonText: {
    ...buttonStyles.secondaryText,
    color: colors.card,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});

export default function AccountManagementScreen() {
  const { user, logout, canMakeDecisions } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pivaInput, setPivaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const loadUserCompanies = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingCompanies(true);
      console.log('Loading companies for user:', user.idCliente);
      
      const userCompanies = await supabaseService.getCompaniesByClientId(user.idCliente);
      console.log('Loaded companies:', userCompanies.length);
      
      setCompanies(userCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      Alert.alert('Errore', 'Impossibile caricare le aziende');
    } finally {
      setLoadingCompanies(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserCompanies();
  }, [loadUserCompanies]);

  const validatePiva = (piva: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleanPiva = piva.replace(/\s/g, '').toUpperCase();
    
    // Check if it's a valid P.IVA (11 digits) or Codice Fiscale (16 alphanumeric)
    const pivaRegex = /^\d{11}$/;
    const cfRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
    
    return pivaRegex.test(cleanPiva) || cfRegex.test(cleanPiva);
  };

  const handleAddPiva = async () => {
    if (!user) return;

    const cleanPiva = pivaInput.replace(/\s/g, '').toUpperCase();
    
    if (!validatePiva(cleanPiva)) {
      Alert.alert('Errore', 'Inserisci una P.IVA o Codice Fiscale valido');
      return;
    }

    try {
      setLoading(true);
      console.log('Associating P.IVA/CF:', cleanPiva);
      
      await supabaseService.associateCompanyToClient(cleanPiva, user.idCliente);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Successo', 'Azienda associata correttamente');
      
      setPivaInput('');
      await loadUserCompanies();
    } catch (error: any) {
      console.error('Error associating company:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Errore', error.message || 'Impossibile associare l\'azienda');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePiva = async (company: Company) => {
    if (!user) return;

    Alert.alert(
      'Conferma Rimozione',
      `Sei sicuro di voler rimuovere l'associazione con ${company.denominazione}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('Removing company association:', company.partitaIva);
              
              await supabaseService.removeCompanyAssociation(company.partitaIva, user.idCliente);
              
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Successo', 'Associazione rimossa correttamente');
              
              await loadUserCompanies();
            } catch (error) {
              console.error('Error removing company:', error);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Errore', 'Impossibile rimuovere l\'associazione');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Conferma Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: () => {
            console.log('User logging out');
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyStateText}>Utente non trovato</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="arrow.left" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestione Account</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni Utente</Text>
          
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Nome Completo</Text>
              <Text style={styles.userInfoValue}>{user.nomeCompleto}</Text>
            </View>
            
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Nome Utente</Text>
              <Text style={styles.userInfoValue}>{user.nomeUtente}</Text>
            </View>
            
            <View style={[styles.userInfoRow, { marginBottom: 0 }]}>
              <Text style={styles.userInfoLabel}>Tipo Utente</Text>
              <View style={styles.userTypeBadge}>
                <IconSymbol 
                  name={canMakeDecisions() ? "pencil" : "eye.fill"} 
                  size={14} 
                  color={colors.primary} 
                />
                <Text style={styles.userTypeBadgeText}>
                  {canMakeDecisions() ? 'Decisionale' : 'Visualizzazione'}
                </Text>
              </View>
            </View>
          </View>

          {!canMakeDecisions() && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ Come utente di visualizzazione, puoi vedere tutti i documenti e gli F24, 
                ma non puoi prendere decisioni (accettare, rifiutare o pagare parzialmente).
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Associa Azienda</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Inserisci P.IVA o Codice Fiscale"
              placeholderTextColor={colors.textSecondary}
              value={pivaInput}
              onChangeText={setPivaInput}
              autoCapitalize="characters"
              editable={!loading}
            />
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPiva}
              disabled={loading || !pivaInput.trim()}
            >
              {loading ? (
                <ActivityIndicator color={colors.secondary} />
              ) : (
                <Text style={styles.addButtonText}>Associa</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aziende Associate</Text>
          
          {loadingCompanies ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : companies.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="business" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                Nessuna azienda associata.{'\n'}Inserisci una P.IVA o Codice Fiscale per iniziare.
              </Text>
            </View>
          ) : (
            <View style={styles.companiesList}>
              {companies.map((company) => (
                <View key={company.idAzienda} style={styles.companyCard}>
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{company.denominazione}</Text>
                    <Text style={styles.companyPiva}>P.IVA: {company.partitaIva}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemovePiva(company)}
                    disabled={loading}
                  >
                    <IconSymbol name="xmark" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Esci</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
