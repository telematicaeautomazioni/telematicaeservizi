
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { supabaseService } from '@/services/supabaseService';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack, router } from 'expo-router';
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
import { Company } from '@/types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    ...commonStyles.card,
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 8,
  },
  userInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userInfoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  badgeDecide: {
    backgroundColor: colors.primary + '20',
  },
  badgeVisualizza: {
    backgroundColor: colors.textSecondary + '20',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextDecide: {
    color: colors.primary,
  },
  badgeTextVisualizza: {
    color: colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    ...buttonStyles.primary,
  },
  addButtonText: {
    ...buttonStyles.primaryText,
  },
  companyCard: {
    ...commonStyles.card,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
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
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  logoutButton: {
    ...buttonStyles.secondary,
    marginTop: 16,
  },
  logoutButtonText: {
    ...buttonStyles.secondaryText,
    color: colors.error,
  },
});

export default function AccountManagementScreen() {
  const { user, logout } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newPiva, setNewPiva] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const loadUserCompanies = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingCompanies(true);
      console.log('Loading companies for user:', user.idCliente);
      const userCompanies = await supabaseService.getCompaniesByClientId(user.idCliente);
      console.log('Loaded', userCompanies.length, 'companies');
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
    const cleaned = piva.replace(/\s/g, '');
    return /^\d{11}$/.test(cleaned);
  };

  const handleAddPiva = async () => {
    if (!user) return;

    const cleanedPiva = newPiva.replace(/\s/g, '');

    if (!validatePiva(cleanedPiva)) {
      Alert.alert('Errore', 'Inserisci una P.IVA valida (11 cifre)');
      return;
    }

    try {
      setLoading(true);
      console.log('Adding P.IVA:', cleanedPiva);
      
      await supabaseService.associateCompanyToClient(cleanedPiva, user.idCliente);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Successo', 'Azienda associata con successo');
      
      setNewPiva('');
      await loadUserCompanies();
    } catch (error: any) {
      console.error('Error adding P.IVA:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Errore', error.message || 'Impossibile associare l\'azienda');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePiva = async (company: Company) => {
    if (!user) return;

    Alert.alert(
      'Conferma',
      `Vuoi rimuovere l'associazione con ${company.denominazione}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Removing P.IVA:', company.partitaIva);
              await supabaseService.removeCompanyAssociation(company.partitaIva, user.idCliente);
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Successo', 'Associazione rimossa');
              
              await loadUserCompanies();
            } catch (error) {
              console.error('Error removing P.IVA:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Errore', 'Impossibile rimuovere l\'associazione');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Conferma',
      'Vuoi disconnetterti?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Disconnetti',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Logging out...');
              await logout();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/login');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Errore', 'Impossibile disconnettersi');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Gestione Account',
            headerShown: true,
            headerBackTitle: 'Indietro',
          }}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Utente non trovato</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Gestione Account',
          headerShown: true,
          headerBackTitle: 'Indietro',
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Il Tuo Account</Text>
          <Text style={styles.headerSubtitle}>
            Gestisci le tue informazioni e le aziende associate
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni Utente</Text>
          <View style={styles.card}>
            <View style={styles.userInfo}>
              <Text style={styles.userInfoLabel}>Nome Completo</Text>
              <Text style={styles.userInfoValue}>{user.nomeCompleto}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userInfoLabel}>Nome Utente</Text>
              <Text style={styles.userInfoValue}>{user.nomeUtente}</Text>
            </View>
            <View
              style={[
                styles.badge,
                user.tipoUtente === 'decide' ? styles.badgeDecide : styles.badgeVisualizza,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  user.tipoUtente === 'decide'
                    ? styles.badgeTextDecide
                    : styles.badgeTextVisualizza,
                ]}
              >
                {user.tipoUtente === 'decide' ? 'Utente Decisionale' : 'Utente Visualizzazione'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aggiungi Azienda</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Partita IVA</Text>
              <TextInput
                style={styles.input}
                placeholder="Inserisci P.IVA (11 cifre)"
                placeholderTextColor={colors.textSecondary}
                value={newPiva}
                onChangeText={setNewPiva}
                keyboardType="numeric"
                maxLength={11}
                editable={!loading}
              />
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPiva}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.secondary} />
              ) : (
                <Text style={styles.addButtonText}>Associa Azienda</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aziende Associate</Text>
          {loadingCompanies ? (
            <View style={styles.card}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : companies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nessuna azienda associata.{'\n'}
                Aggiungi una P.IVA per iniziare.
              </Text>
            </View>
          ) : (
            companies.map((company) => (
              <View key={company.idAzienda} style={styles.companyCard}>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{company.denominazione}</Text>
                  <Text style={styles.companyPiva}>P.IVA: {company.partitaIva}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePiva(company)}
                >
                  <IconSymbol name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Disconnetti</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
