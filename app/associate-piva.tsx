
import { useAuth } from '@/contexts/AuthContext';
import { Company } from '@/types';
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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabaseService } from '@/services/supabaseService';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect, useCallback } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    ...commonStyles.card,
    marginBottom: 24,
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
  associateButton: {
    ...buttonStyles.primary,
  },
  associateButtonText: {
    ...buttonStyles.primaryText,
  },
  companiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  companyItem: {
    flexDirection: 'row',
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
    marginLeft: 12,
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
  continueButton: {
    ...buttonStyles.primary,
  },
  continueButtonText: {
    ...buttonStyles.primaryText,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default function AssociatePivaScreen() {
  const { user } = useAuth();
  const [piva, setPiva] = useState('');
  const [loading, setLoading] = useState(false);
  const [associatedCompanies, setAssociatedCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const loadAssociatedCompanies = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingCompanies(true);
      console.log('Loading associated companies for user:', user.idCliente);
      
      const companies = await supabaseService.getCompaniesByClientId(user.idCliente);
      console.log('Loaded associated companies:', companies.length);
      
      setAssociatedCompanies(companies);
    } catch (error) {
      console.error('Error loading associated companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  }, [user]);

  useEffect(() => {
    loadAssociatedCompanies();
  }, [loadAssociatedCompanies]);

  const handleAssociate = async () => {
    if (!piva.trim()) {
      Alert.alert('Errore', 'Inserisci una Partita IVA o un Codice Fiscale');
      return;
    }

    const cleanPiva = piva.replace(/\s/g, '').toUpperCase();

    // Validate P.IVA format (11 digits) or CF format (16 alphanumeric characters)
    const isPivaValid = /^\d{11}$/.test(cleanPiva);
    const isCfValid = /^[A-Z0-9]{16}$/.test(cleanPiva);

    if (!isPivaValid && !isCfValid) {
      Alert.alert(
        'Errore', 
        'Formato non valido. Inserisci una Partita IVA (11 cifre) o un Codice Fiscale (16 caratteri alfanumerici).'
      );
      return;
    }

    try {
      setLoading(true);
      console.log('Associating P.IVA/CF:', cleanPiva);

      // Check if company exists
      const company = await supabaseService.getCompanyByPiva(cleanPiva);

      if (!company) {
        Alert.alert('Errore', 'Azienda non trovata con questa Partita IVA o Codice Fiscale');
        return;
      }

      // Check if already associated
      if (company.idClienteAssociato) {
        Alert.alert('Errore', 'Questa Partita IVA o Codice Fiscale è già associato a un altro account');
        return;
      }

      // Associate company with user
      await supabaseService.associateCompanyToClient(cleanPiva, user!.idCliente);

      Alert.alert('Successo', 'Partita IVA o Codice Fiscale associato correttamente');
      setPiva('');
      await loadAssociatedCompanies();
    } catch (error) {
      console.error('Error associating P.IVA/CF:', error);
      Alert.alert('Errore', 'Impossibile associare la Partita IVA o il Codice Fiscale');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (associatedCompanies.length === 0) {
      Alert.alert('Attenzione', 'Devi associare almeno una Partita IVA o un Codice Fiscale per continuare');
      return;
    }

    router.replace('/(tabs)/(home)');
  };

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <View style={styles.companyItem}>
      <IconSymbol name="business" size={24} color={colors.primary} />
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{item.denominazione}</Text>
        <Text style={styles.companyPiva}>P.IVA/CF: {item.partitaIva}</Text>
      </View>
      <IconSymbol name="check-circle" size={24} color={colors.success} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/c64fce72-61c9-461d-ae06-0380f4682de5.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Associa Partite IVA</Text>
          <Text style={styles.subtitle}>
            Inserisci le Partite IVA delle tue aziende, o il tuo codice fiscale, per accedere ai documenti
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Partita IVA o Codice Fiscale</Text>
            <TextInput
              style={styles.input}
              placeholder="Inserisci P.IVA (11 cifre) o CF (16 caratteri)"
              placeholderTextColor={colors.textSecondary}
              value={piva}
              onChangeText={setPiva}
              keyboardType="default"
              autoCapitalize="characters"
              maxLength={20}
              editable={!loading}
            />
          </View>
          <TouchableOpacity
            style={styles.associateButton}
            onPress={handleAssociate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <Text style={styles.associateButtonText}>Associa</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.companiesSection}>
          <Text style={styles.sectionTitle}>Aziende Associate</Text>
          {loadingCompanies ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : associatedCompanies.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="business" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                Nessuna azienda associata.{'\n'}Inserisci una Partita IVA o un Codice Fiscale per iniziare.
              </Text>
            </View>
          ) : (
            <FlatList
              data={associatedCompanies}
              renderItem={renderCompanyItem}
              keyExtractor={(item) => item.idAzienda}
              scrollEnabled={false}
            />
          )}
        </View>

        {associatedCompanies.length > 0 && (
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
