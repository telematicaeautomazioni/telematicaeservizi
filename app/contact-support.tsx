
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: colors.secondary,
    borderRadius: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  card: {
    ...commonStyles.card,
    padding: 24,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  phoneButton: {
    backgroundColor: colors.primary,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chevron: {
    marginLeft: 8,
  },
  infoCard: {
    ...commonStyles.card,
    padding: 20,
    backgroundColor: colors.highlight,
    borderColor: colors.primaryLight,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default function ContactSupportScreen() {
  const handleWhatsApp = async () => {
    const phoneNumber = '+393510291418';
    const message = 'Ciao, ho cambiato idea riguardo a un F24 e vorrei assistenza.';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'WhatsApp non disponibile',
          'WhatsApp non è installato sul tuo dispositivo. Puoi contattarci al numero +39 351 0291418'
        );
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert('Errore', 'Impossibile aprire WhatsApp');
    }
  };

  const handlePhone = async () => {
    const phoneNumber = 'tel:0639754455';

    try {
      const supported = await Linking.canOpenURL(phoneNumber);
      if (supported) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert('Errore', 'Impossibile effettuare la chiamata');
      }
    } catch (error) {
      console.error('Error making phone call:', error);
      Alert.alert('Errore', 'Impossibile effettuare la chiamata');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Image
            source={require('@/assets/images/c64fce72-61c9-461d-ae06-0380f4682de5.jpeg')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Contattaci</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Hai cambiato idea?</Text>
        <Text style={styles.subtitle}>
          Nessun problema! Contattaci e ti aiuteremo a gestire la tua richiesta.
        </Text>

        <TouchableOpacity
          style={[styles.contactButton, styles.whatsappButton]}
          onPress={handleWhatsApp}
        >
          <View style={styles.contactIcon}>
            <IconSymbol name="message.fill" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Contattaci su WhatsApp</Text>
            <Text style={styles.contactValue}>+39 351 0291418</Text>
          </View>
          <IconSymbol name="chevron.right" size={24} color="#FFFFFF" style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactButton, styles.phoneButton]}
          onPress={handlePhone}
        >
          <View style={styles.contactIcon}>
            <IconSymbol name="phone.fill" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Chiamaci telefonicamente</Text>
            <Text style={styles.contactValue}>06 39754455</Text>
          </View>
          <IconSymbol name="chevron.right" size={24} color="#FFFFFF" style={styles.chevron} />
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={32} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={styles.infoText}>
            Il nostro team è disponibile per assisterti e trovare la soluzione migliore per le tue esigenze.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
