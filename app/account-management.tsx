
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
import { useAuth } from '@/contexts/AuthContext';
import { Company } from '@/types';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabaseService } from '@/services/supabaseService';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect, useCallback } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: colors.secondary,
    borderRadius: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  scrollContent: {
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
  card: {
    ...commonStyles.card,
    backgroundColor: colors.card,
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
    marginTop: 8,
  },
  addButtonText: {
    ...buttonStyles.primaryText,
  },
  companyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    padding: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButton: {
    ...buttonStyles.danger,
    marginTop: 16,
  },
  logoutButtonText: {
    ...buttonStyles.dangerText,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default function AccountManagementScreen() {
  const { user, logout } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newPiva, setNewPiva] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadUserCompanies = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Loading companies for user:', user.idCliente);
      
      const userCompanies = await supabaseService.getCompaniesByClientId(user.idCliente);
      console.log('Loaded companies:', userCompanies.length);
      
      setCompanies(userCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      Alert.alert('Errore', 'Impossibile caricare le aziende');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserCompanies();
  }, [loadUserCompanies]);

  const validatePiva = (piva: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleanPiva = piva.replace(/\s/g, '').toUpperCase();
    
    // Italian P.IVA is 11 digits
    if (!/^\d{11}$/.test(cleanPiva)) {
      return false;
    }
    
    return true;
  };

  const handleAddPiva = async () => {
    if (!newPiva.trim()) {
      Alert.alert('Errore', 'Inserisci una Partita IVA');
      return;
    }

    const cleanPiva = newPiva.replace(/\s/g, '').toUpperCase();

    if (!validatePiva(cleanPiva)) {
      Alert.alert('Errore', 'Partita IVA non valida. Deve essere di 11 cifre.');
      return;
    }

    try {
      setAdding(true);
      console.log('Adding P.IVA:', cleanPiva);

      // Check if company exists
      const company = await supabaseService.getCompanyByPiva(cleanPiva);

      if (!company) {
        Alert.alert('Errore', 'Azienda non trovata con questa Partita IVA');
        return;
      }

      // Check if already associated
      if (company.idClienteAssociato) {
        Alert.alert('Errore', 'Questa Partita IVA è già associata a un altro account');
        return;
      }

      // Associate company with user
      await supabaseService.associateCompanyToClient(cleanPiva, user!.idCliente);

      Alert.alert('Successo', 'Partita IVA associata correttamente');
      setNewPiva('');
      await loadUserCompanies();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding P.IVA:', error);
      Alert.alert('Errore', 'Impossibile associare la Partita IVA');
    } finally {
      setAdding(false);
    }
  };

  const handleRemovePiva = async (company: Company) => {
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
              
              await supabaseService.removeCompanyAssociation(company.partitaIva, user!.idCliente);
              
              Alert.alert('Successo', 'Associazione rimossa correttamente');
              await loadUserCompanies();
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error removing P.IVA:', error);
              Alert.alert('Errore', 'Impossibile rimuovere l\'associazione');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Conferma',
      'Vuoi effettuare il logout?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Image
            source={require('@/assets/images/c64fce72-61c9-461d-ae06-0380f4682de5.jpeg')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Gestione Account</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aggiungi Partita IVA</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Partita IVA</Text>
              <TextInput
                style={styles.input}
                placeholder="Inserisci la Partita IVA (11 cifre)"
                placeholderTextColor={colors.textSecondary}
                value={newPiva}
                onChangeText={setNewPiva}
                keyboardType="numeric"
                maxLength={11}
                editable={!adding}
              />
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPiva}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color={colors.secondary} />
              ) : (
                <Text style={styles.addButtonText}>Aggiungi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aziende Associate</Text>
          {loading ? (
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
              <View key={company.idAzienda} style={styles.companyItem}>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{company.denominazione}</Text>
                  <Text style={styles.companyPiva}>P.IVA: {company.partitaIva}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePiva(company)}
                >
                  <IconSymbol name="close" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Utente</Text>
            <Text style={{ fontSize: 16, color: colors.text, marginBottom: 16 }}>
              {user?.nomeUtente}
            </Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
