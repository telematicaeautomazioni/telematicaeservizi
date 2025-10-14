
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
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { Company } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';
import { googleSheetsService } from '@/services/googleSheetsService';

export default function AssociatePivaScreen() {
  const [piva, setPiva] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [associatedCompanies, setAssociatedCompanies] = useState<Company[]>([]);
  const { user, setIsFirstAccess } = useAuth();

  useEffect(() => {
    loadAssociatedCompanies();
  }, []);

  const loadAssociatedCompanies = async () => {
    if (!user) return;

    try {
      setLoadingCompanies(true);
      const companies = await googleSheetsService.getCompaniesByClientId(user.idCliente);
      setAssociatedCompanies(companies);
      console.log('Loaded associated companies:', companies.length);
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

    if (piva.length !== 11) {
      Alert.alert('Errore', 'La Partita IVA deve essere di 11 cifre');
      return;
    }

    if (!user) {
      Alert.alert('Errore', 'Utente non autenticato');
      return;
    }

    setLoading(true);
    console.log('Associating P.IVA:', piva);

    try {
      // Verifica se l'azienda esiste
      const company = await googleSheetsService.getCompanyByPiva(piva);

      if (!company) {
        Alert.alert('Errore', 'Partita IVA non trovata');
        setLoading(false);
        return;
      }

      if (company.idClienteAssociato && company.idClienteAssociato !== user.idCliente) {
        Alert.alert('Errore', 'Questa Partita IVA è già associata ad un altro cliente');
        setLoading(false);
        return;
      }

      // Associa l'azienda al cliente
      await googleSheetsService.associateCompanyToClient(piva, user.idCliente);
      
      console.log('Company associated:', company.denominazione);
      Alert.alert('Successo', `Azienda "${company.denominazione}" associata con successo`);

      // Ricarica le aziende associate
      await loadAssociatedCompanies();
      setPiva('');
    } catch (error) {
      console.error('Error associating company:', error);
      Alert.alert('Errore', 'Impossibile associare l\'azienda. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (associatedCompanies.length === 0) {
      Alert.alert('Attenzione', 'Devi associare almeno una Partita IVA per continuare');
      return;
    }

    console.log('Continuing to dashboard with', associatedCompanies.length, 'companies');
    setIsFirstAccess(false);
    router.replace('/(tabs)/(home)');
  };

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <View style={styles.companyCard}>
      <View style={styles.companyIcon}>
        <IconSymbol name="building.2" size={24} color={colors.primary} />
      </View>
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{item.denominazione}</Text>
        <Text style={styles.companyPiva}>P.IVA: {item.partitaIva}</Text>
      </View>
      <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Associa Partita IVA</Text>
          <Text style={styles.subtitle}>
            Inserisci la Partita IVA della tua azienda per accedere ai documenti
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Partita IVA</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Inserisci 11 cifre"
              placeholderTextColor={colors.textSecondary}
              value={piva}
              onChangeText={setPiva}
              keyboardType="numeric"
              maxLength={11}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.associateButton]}
            onPress={handleAssociate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Text style={buttonStyles.text}>Associa</Text>
            )}
          </TouchableOpacity>
        </View>

        {loadingCompanies ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Caricamento aziende...</Text>
          </View>
        ) : associatedCompanies.length > 0 ? (
          <View style={styles.companiesSection}>
            <Text style={styles.sectionTitle}>Aziende Associate</Text>
            <FlatList
              data={associatedCompanies}
              renderItem={renderCompanyItem}
              keyExtractor={(item) => item.idAzienda}
              scrollEnabled={false}
            />

            <TouchableOpacity
              style={[buttonStyles.primary, styles.continueButton]}
              onPress={handleContinue}
            >
              <Text style={buttonStyles.text}>Prosegui</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.infoBox}>
          <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Le Partite IVA disponibili sono caricate da Google Sheets
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  associateButton: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  companiesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  continueButton: {
    marginTop: 16,
  },
  infoBox: {
    padding: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
