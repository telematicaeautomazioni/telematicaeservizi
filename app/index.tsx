
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default function Index() {
  const { user, isLoading } = useAuth();
  const [hasCompanies, setHasCompanies] = useState<boolean | null>(null);
  const [checkingCompanies, setCheckingCompanies] = useState(false);

  useEffect(() => {
    const checkUserCompanies = async () => {
      if (user && !isLoading) {
        console.log('Checking if user has companies...');
        setCheckingCompanies(true);
        try {
          const companies = await supabaseService.getCompaniesByClientId(user.idCliente);
          console.log('User has', companies.length, 'companies');
          setHasCompanies(companies.length > 0);
        } catch (error) {
          console.error('Error checking companies:', error);
          setHasCompanies(false);
        } finally {
          setCheckingCompanies(false);
        }
      }
    };

    checkUserCompanies();
  }, [user, isLoading]);

  // Show loading spinner while checking authentication
  if (isLoading || (user && checkingCompanies)) {
    console.log('Loading authentication state...');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user is logged in
  if (user) {
    console.log('User is logged in:', user.nomeUtente);
    
    // If we're still checking companies, show loading
    if (hasCompanies === null) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    
    // Redirect based on whether user has companies
    if (hasCompanies) {
      console.log('Redirecting to home');
      return <Redirect href="/(tabs)/(home)" />;
    } else {
      console.log('Redirecting to associate P.IVA');
      return <Redirect href="/associate-piva" />;
    }
  }

  // No user logged in, redirect to login
  console.log('No user logged in, redirecting to login');
  return <Redirect href="/login" />;
}
