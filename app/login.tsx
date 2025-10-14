
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { googleSheetsService } from '@/services/googleSheetsService';
import { useGoogleSheets } from '@/contexts/GoogleSheetsContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, setIsFirstAccess } = useAuth();
  const { isAuthenticated, authenticate } = useGoogleSheets();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Errore', 'Inserisci nome utente e password');
      return;
    }

    setLoading(true);
    console.log('Attempting login for:', username);

    try {
      // Prima verifica se siamo autenticati con Google Sheets
      if (!isAuthenticated) {
        Alert.alert(
          'Connessione Google Sheets',
          'Per accedere, devi prima connetterti a Google Sheets',
          [
            {
              text: 'Annulla',
              style: 'cancel',
              onPress: () => setLoading(false),
            },
            {
              text: 'Connetti',
              onPress: async () => {
                const success = await authenticate();
                if (success) {
                  // Riprova il login dopo l'autenticazione
                  await performLogin();
                } else {
                  Alert.alert('Errore', 'Impossibile connettersi a Google Sheets');
                  setLoading(false);
                }
              },
            },
          ]
        );
        return;
      }

      await performLogin();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante il login');
      setLoading(false);
    }
  };

  const performLogin = async () => {
    try {
      // Cerca l'utente nel foglio Google Sheets
      const user = await googleSheetsService.getClientByUsername(username);

      if (user && user.password === password) {
        console.log('Login successful for:', user.nomeCompleto);
        
        // Verifica se l'utente ha aziende associate
        const companies = await googleSheetsService.getCompaniesByClientId(user.idCliente);
        const hasCompanies = companies.length > 0;

        login(user);
        
        if (!hasCompanies) {
          console.log('First access - redirecting to association');
          setIsFirstAccess(true);
          router.replace('/associate-piva');
        } else {
          console.log('Redirecting to dashboard');
          router.replace('/(tabs)/(home)');
        }
      } else {
        console.log('Login failed - invalid credentials');
        Alert.alert('Errore', 'Nome utente o password non validi');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert(
        'Errore',
        'Impossibile verificare le credenziali. Controlla la connessione a Google Sheets.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="building.2.fill" size={60} color={colors.primary} />
            </View>
            <Text style={styles.title}>Studio Commerciale</Text>
            <Text style={styles.subtitle}>Gestione Documenti F24</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome Utente</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Inserisci nome utente"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Inserisci password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.loginButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={buttonStyles.text}>Accedi</Text>
              )}
            </TouchableOpacity>

            {!isAuthenticated && (
              <View style={styles.warningBox}>
                <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
                <Text style={styles.warningText}>
                  Non sei connesso a Google Sheets. Clicca su Accedi per connetterti.
                </Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                I dati vengono caricati direttamente da Google Sheets
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
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
  loginButton: {
    marginTop: 8,
  },
  warningBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  infoBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
