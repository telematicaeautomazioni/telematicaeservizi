
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
import { mockClients, mockCompanies } from '@/data/mockData';
import { IconSymbol } from '@/components/IconSymbol';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, setIsFirstAccess } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Errore', 'Inserisci nome utente e password');
      return;
    }

    setLoading(true);
    console.log('Attempting login for:', username);

    // Simulate API call
    setTimeout(() => {
      const user = mockClients.find(
        (c) => c.nomeUtente === username && c.password === password
      );

      if (user) {
        console.log('Login successful for:', user.nomeCompleto);
        
        // Check if user has associated companies
        const hasCompanies = mockCompanies.some(
          (c) => c.idClienteAssociato === user.idCliente
        );

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
      setLoading(false);
    }, 1000);
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

            <View style={styles.demoInfo}>
              <Text style={styles.demoText}>Demo: username &quot;demo&quot; password &quot;demo&quot;</Text>
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
  demoInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
});
