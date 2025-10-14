
import React, { useState } from 'react';
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
import { mockCompanies } from '@/data/mockData';
import { Company } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';

export default function AssociatePivaScreen() {
  const [piva, setPiva] = useState('');
  const [loading, setLoading] = useState(false);
  const [associatedCompanies, setAssociatedCompanies] = useState<Company[]>([]);
  const { user, setIsFirstAccess } = useAuth();

  const handleAssociate = async () => {
    if (!piva.trim()) {
      Alert.alert('Errore', 'Inserisci una Partita IVA');
      return;
    }

    if (piva.length !== 11) {
      Alert.alert('Errore', 'La Partita IVA deve essere di 11 cifre');
      return;
    }

    setLoading(true);
    console.log('Associating P.IVA:', piva);

    // Simulate API call
    setTimeout(() => {
      const company = mockCompanies.find((c) => c.partitaIva === piva);

      if (!company) {
        Alert.alert('Errore', 'Partita IVA non trovata');
        setLoading(false);
        return;
      }

      if (company.idClienteAssociato && company.idClienteAssociato !== user?.idCliente) {
        Alert.alert('Errore', 'Questa Partita IVA è già associata ad un altro cliente');
        setLoading(false);
        return;
      }

      // Associate company
      company.idClienteAssociato = user?.idCliente || null;
      
      if (!associatedCompanies.find((c) => c.idAzienda === company.idAzienda)) {
        setAssociatedCompanies([...associatedCompanies, company]);
        console.log('Company associated:', company.denominazione);
        Alert.alert('Successo', `Azienda "${company.denominazione}" associata con successo`);
      }

      setPiva('');
      setLoading(false);
    }, 1000);
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

        {associatedCompanies.length > 0 && (
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
        )}

        <View style={styles.demoInfo}>
          <Text style={styles.demoText}>
            Demo P.IVA disponibili:{'\n'}
            12345678901 (Rossi S.r.l.){'\n'}
            11111111111 (Verdi & Co.)
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
  demoInfo: {
    padding: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
