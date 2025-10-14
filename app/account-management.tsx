
import { Stack, router } from 'expo-router';
import { Company } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '@/services/supabaseService';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    ...buttonStyles.primary,
    paddingHorizontal: 24,
  },
  addButtonText: {
    ...buttonStyles.primaryText,
  },
  companyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  logoutButton: {
    ...buttonStyles.secondary,
    backgroundColor: colors.error,
    marginTop: 'auto',
  },
  logoutButtonText: {
    ...buttonStyles.secondaryText,
    color: '#fff',
  },
});

export default function AccountManagementScreen() {
  const { user, logout } = useAuth();
  const [piva, setPiva] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  const loadUserCompanies = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingCompanies(true);
      const userCompanies = await supabaseService.getCompaniesByClientId(user.idCliente);
      console.log('Loaded user companies:', userCompanies.length);
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
    return /^\d{11}$/.test(piva.trim());
  };

  const handleAddPiva = async () => {
    if (!piva.trim()) {
      Alert.alert('Errore', 'Inserisci una Partita IVA');
      return;
    }

    if (!validatePiva(piva)) {
      Alert.alert('Errore', 'La Partita IVA deve contenere 11 cifre');
      return;
    }

    if (!user) {
      Alert.alert('Errore', 'Utente non autenticato');
      return;
    }

    setLoading(true);

    try {
      await supabaseService.associateCompanyToClient(piva.trim(), user.idCliente);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Successo', 'Azienda associata correttamente');
      setPiva('');
      await loadUserCompanies();
    } catch (error: any) {
      console.error('Error adding company:', error);
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
      `Vuoi rimuovere l'associazione con ${company.denominazione}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabaseService.removeCompanyAssociation(company.partitaIva, user.idCliente);
              
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Successo', 'Associazione rimossa');
              await loadUserCompanies();
            } catch (error) {
              console.error('Error removing company:', error);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Errore', 'Impossibile rimuovere l\'associazione');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Conferma Logout', 'Sei sicuro di voler uscire?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await supabaseService.logout();
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestione Account</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aggiungi Partita IVA</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Inserisci P.IVA (11 cifre)"
              placeholderTextColor={colors.textSecondary}
              value={piva}
              onChangeText={setPiva}
              keyboardType="numeric"
              maxLength={11}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPiva}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Aggiungi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aziende Associate</Text>
          
          {loadingCompanies ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : companies.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="business" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                Nessuna azienda associata
              </Text>
            </View>
          ) : (
            companies.map((company) => (
              <View key={company.idAzienda} style={styles.companyCard}>
                <View style={styles.companyIcon}>
                  <IconSymbol name="business" size={24} color={colors.primary} />
                </View>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{company.denominazione}</Text>
                  <Text style={styles.companyPiva}>P.IVA: {company.partitaIva}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePiva(company)}
                >
                  <IconSymbol name="delete" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Esci</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
