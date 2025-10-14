
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabaseService } from '@/services/supabaseService';
import { notificationService } from '@/services/notificationService';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import React, { useState, useEffect } from 'react';
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
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
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
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
  loginButton: {
    ...buttonStyles.primary,
    marginTop: 8,
  },
  loginButtonText: {
    ...buttonStyles.primaryText,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default function LoginScreen() {
  const { user, login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Check if user is already logged in (persistent session)
  useEffect(() => {
    const checkSession = async () => {
      if (!isLoading && user && !hasCheckedSession) {
        console.log('User session found, checking companies...');
        setHasCheckedSession(true);
        await checkUserCompaniesAndRedirect();
      } else if (!isLoading && !user) {
        console.log('No user session found, showing login screen');
        setHasCheckedSession(true);
      }
    };

    checkSession();
  }, [isLoading, user, hasCheckedSession]);

  const checkUserCompaniesAndRedirect = async () => {
    if (!user) {
      console.log('No user found, cannot check companies');
      return;
    }

    try {
      console.log('Checking companies for user:', user.idCliente);
      const companies = await supabaseService.getCompaniesByClientId(user.idCliente);
      console.log('User has', companies.length, 'associated companies');

      if (companies.length === 0) {
        console.log('No companies found, redirecting to association page');
        router.replace('/associate-piva');
      } else {
        console.log('Companies found, redirecting to home');
        router.replace('/(tabs)/(home)');
      }
    } catch (error) {
      console.error('Error checking companies:', error);
      // If there's an error checking companies, stay on login page
      Alert.alert('Errore', 'Si è verificato un errore. Riprova ad accedere.');
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Errore', 'Inserisci nome utente e password');
      return;
    }

    await performLogin();
  };

  const performLogin = async () => {
    try {
      setLoading(true);
      console.log('Attempting login for user:', username);

      const userData = await supabaseService.login(username, password);

      if (!userData) {
        Alert.alert('Errore', 'Nome utente o password non corretti');
        return;
      }

      console.log('Login successful, user:', userData.nomeUtente);
      await login(userData);

      // Register for push notifications
      console.log('Registering for push notifications...');
      await notificationService.registerForPushNotifications(userData.idCliente);

      // Check if user has associated companies
      const companies = await supabaseService.getCompaniesByClientId(userData.idCliente);
      console.log('User has', companies.length, 'associated companies');

      if (companies.length === 0) {
        // No companies associated, redirect to association screen
        console.log('No companies, redirecting to association page');
        router.replace('/associate-piva');
      } else {
        // Has companies, go to home
        console.log('Has companies, redirecting to home');
        router.replace('/(tabs)/(home)');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (isLoading || !hasCheckedSession) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>
            Caricamento...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If user is logged in, don't show the login form (redirect is happening)
  if (user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>
            Reindirizzamento...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.subtitle}>Accedi al tuo account</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome Utente</Text>
              <TextInput
                style={styles.input}
                placeholder="Inserisci il nome utente"
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
                style={styles.input}
                placeholder="Inserisci la password"
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
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Telematica E Servizi{'\n'}
              Tutti i diritti riservati
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
