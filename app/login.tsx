
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { router } from 'expo-router';
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
  Image,
} from 'react-native';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  loginButton: {
    ...buttonStyles.primary,
    marginTop: 24,
  },
  loginButtonText: {
    ...buttonStyles.primaryText,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login, setIsFirstAccess } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Inserisci nome utente e password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await performLogin();
    } catch (err) {
      console.error('Login error:', err);
      setError('Errore durante il login. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const performLogin = async () => {
    try {
      const user = await supabaseService.login(username.trim(), password);

      if (!user) {
        setError('Nome utente o password non corretti');
        return;
      }

      // Login successful
      login(user);

      // Check if user has associated companies
      const companies = await supabaseService.getCompaniesByClientId(user.idCliente);

      if (companies.length === 0) {
        // First access - redirect to P.IVA association
        setIsFirstAccess(true);
        router.replace('/associate-piva');
      } else {
        // User has companies - go to dashboard
        setIsFirstAccess(false);
        router.replace('/(tabs)/(home)');
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/c64fce72-61c9-461d-ae06-0380f4682de5.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Telematica E Servizi</Text>
            <Text style={styles.subtitle}>Gestione Documenti e F24</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome Utente</Text>
            <TextInput
              style={[styles.input, usernameFocused && styles.inputFocused]}
              placeholder="Inserisci il tuo nome utente"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordFocused && styles.inputFocused]}
              placeholder="Inserisci la tua password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              editable={!loading}
              onSubmitEditing={handleLogin}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <Text style={styles.loginButtonText}>Accedi</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
