
import { Company } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
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
  associateButton: {
    ...buttonStyles.primary,
    paddingHorizontal: 24,
  },
  associateButtonText: {
    ...buttonStyles.primaryText,
  },
  companiesSection: {
    flex: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  continueButton: {
    ...buttonStyles.primary,
  },
  continueButtonText: {
    ...buttonStyles.primaryText,
  },
});

export default function AssociatePivaScreen() {
  const [piva, setPiva] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadAssociatedCompanies();
  }, []);

  const loadAssociatedCompanies = async () => {
    if (!user) return;

    try {
      setLoadingCompanies(true);
      const userCompanies = await supabaseService.getCompaniesByClientId(user.idCliente);
      console.log('Loaded companies:', userCompanies.length);
      setCompanies(userCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      Alert.alert('Errore', 'Impossibile caricare le aziende associate');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleAssociate = async () => {
    if (!piva.trim()) {
      Alert.alert('Errore', 'Inserisci una Partita IVA');
      return;
    }

    if (!user) {
      Alert.alert('Errore', 'Utente non autenticato');
      return;
    }

    // Basic P.IVA validation (11 digits)
    if (!/^\d{11}$/.test(piva.trim())) {
      Alert.alert('Errore', 'La Partita IVA deve contenere 11 cifre');
      return;
    }

    setLoading(true);

    try {
      await supabaseService.associateCompanyToClient(piva.trim(), user.idCliente);
      
      Alert.alert('Successo', 'Azienda associata correttamente');
      setPiva('');
      await loadAssociatedCompanies();
    } catch (error: any) {
      console.error('Error associating company:', error);
      Alert.alert('Errore', error.message || 'Impossibile associare l\'azienda');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (companies.length === 0) {
      Alert.alert('Attenzione', 'Devi associare almeno una Partita IVA per continuare');
      return;
    }

    router.replace('/(tabs)/(home)');
  };

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <View style={styles.companyCard}>
      <View style={styles.companyIcon}>
        <IconSymbol name="business" size={24} color={colors.primary} />
      </View>
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{item.denominazione}</Text>
        <Text style={styles.companyPiva}>P.IVA: {item.partitaIva}</Text>
      </View>
      <IconSymbol name="check-circle" size={24} color={colors.success} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Associa Partita IVA</Text>
          <Text style={styles.subtitle}>
            Inserisci la Partita IVA della tua azienda per accedere ai documenti e alle scadenze
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Partita IVA</Text>
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
              style={styles.associateButton}
              onPress={handleAssociate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.associateButtonText}>Associa</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.companiesSection}>
          <Text style={styles.sectionTitle}>Aziende Associate</Text>
          
          {loadingCompanies ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : companies.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="business" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                Nessuna azienda associata.{'\n'}Inserisci una Partita IVA per iniziare.
              </Text>
            </View>
          ) : (
            <FlatList
              data={companies}
              renderItem={renderCompanyItem}
              keyExtractor={(item) => item.idAzienda}
              scrollEnabled={false}
            />
          )}
        </View>

        {companies.length > 0 && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Prosegui</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
