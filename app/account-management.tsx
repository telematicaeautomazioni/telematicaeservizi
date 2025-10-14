
import React, { useState, useEffect } from 'react';
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
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { mockCompanies } from '@/data/mockData';
import { Company } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

export default function AccountManagementScreen() {
  const { user, logout } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pivaInput, setPivaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddingPiva, setIsAddingPiva] = useState(false);

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      router.replace('/login');
      return;
    }

    loadUserCompanies();
  }, [user]);

  const loadUserCompanies = () => {
    if (!user) return;

    const userCompanies = mockCompanies.filter(
      (c) => c.idClienteAssociato === user.idCliente
    );
    console.log('Loaded user companies:', userCompanies.length);
    setCompanies(userCompanies);
  };

  const validatePiva = (piva: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleanPiva = piva.replace(/\s/g, '').trim();

    // Check if it's 11 digits
    if (!/^\d{11}$/.test(cleanPiva)) {
      Alert.alert('Errore', 'La Partita IVA deve contenere esattamente 11 cifre');
      return false;
    }

    return true;
  };

  const handleAddPiva = async () => {
    if (!user) return;

    if (!pivaInput.trim()) {
      Alert.alert('Errore', 'Inserisci una Partita IVA');
      return;
    }

    const cleanPiva = pivaInput.replace(/\s/g, '').trim();

    if (!validatePiva(cleanPiva)) {
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate API call
    setTimeout(() => {
      // Check if P.IVA exists in the system
      const company = mockCompanies.find((c) => c.partitaIva === cleanPiva);

      if (!company) {
        setLoading(false);
        Alert.alert('Errore', 'Partita IVA non trovata nel sistema');
        return;
      }

      // Check if already associated with this user
      if (company.idClienteAssociato === user.idCliente) {
        setLoading(false);
        Alert.alert('Attenzione', 'Questa Partita IVA è già associata al tuo account');
        return;
      }

      // Check if already associated with another user
      if (company.idClienteAssociato && company.idClienteAssociato !== user.idCliente) {
        setLoading(false);
        Alert.alert('Errore', 'Questa Partita IVA è già associata ad un altro utente');
        return;
      }

      // Associate the company with the user
      company.idClienteAssociato = user.idCliente;
      console.log('Associated P.IVA:', cleanPiva, 'to user:', user.nomeUtente);

      loadUserCompanies();
      setPivaInput('');
      setIsAddingPiva(false);
      setLoading(false);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Successo', `Partita IVA ${cleanPiva} associata con successo`);
    }, 1000);
  };

  const handleRemovePiva = (company: Company) => {
    Alert.alert(
      'Rimuovi Associazione',
      `Sei sicuro di voler rimuovere l'associazione con ${company.denominazione}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            // Remove association
            company.idClienteAssociato = null;
            console.log('Removed P.IVA association:', company.partitaIva);

            loadUserCompanies();

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Successo', 'Associazione rimossa con successo');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Sei sicuro di voler uscire?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Gestione Account',
          headerBackTitle: 'Indietro',
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* User Info Section */}
        <View style={styles.section}>
          <View style={styles.userInfoCard}>
            <View style={styles.userIconContainer}>
              <IconSymbol name="person.circle.fill" size={64} color={colors.primary} />
            </View>
            <Text style={styles.userName}>{user.nomeCompleto}</Text>
            <Text style={styles.userEmail}>{user.nomeUtente}</Text>
          </View>
        </View>

        {/* P.IVA Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Partite IVA Associate</Text>
            <Text style={styles.sectionSubtitle}>
              {companies.length} {companies.length === 1 ? 'azienda' : 'aziende'}
            </Text>
          </View>

          {companies.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="building.2" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Nessuna Partita IVA associata</Text>
            </View>
          ) : (
            <View style={styles.companiesList}>
              {companies.map((company) => (
                <View key={company.idAzienda} style={styles.companyCard}>
                  <View style={styles.companyInfo}>
                    <View style={styles.companyIconContainer}>
                      <IconSymbol name="building.2" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.companyDetails}>
                      <Text style={styles.companyName}>{company.denominazione}</Text>
                      <Text style={styles.companyPiva}>P.IVA: {company.partitaIva}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemovePiva(company)}
                  >
                    <IconSymbol name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add P.IVA Section */}
          {!isAddingPiva ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setIsAddingPiva(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
              <Text style={styles.addButtonText}>Aggiungi Partita IVA</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addPivaForm}>
              <Text style={styles.formLabel}>Inserisci Partita IVA</Text>
              <TextInput
                style={styles.input}
                placeholder="Es: 12345678901"
                placeholderTextColor={colors.textSecondary}
                value={pivaInput}
                onChangeText={setPivaInput}
                keyboardType="numeric"
                maxLength={11}
                autoFocus
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => {
                    setIsAddingPiva(false);
                    setPivaInput('');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.confirmButton]}
                  onPress={handleAddPiva}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.card} />
                  ) : (
                    <Text style={styles.confirmButtonText}>Associa</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={colors.error} />
            <Text style={styles.logoutButtonText}>Esci dall&apos;account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  userInfoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userIconContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  companiesList: {
    gap: 12,
    marginBottom: 16,
  },
  companyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  companyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyDetails: {
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
    borderRadius: 8,
    backgroundColor: colors.errorLight,
  },
  addButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  addPivaForm: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  logoutButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
