
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { Document } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';

interface DocumentItemProps {
  document: Document;
}

export default function DocumentItem({ document }: DocumentItemProps) {
  const handleOpenPdf = async () => {
    console.log('Opening document PDF:', document.linkPdf);
    try {
      const supported = await Linking.canOpenURL(document.linkPdf);
      if (supported) {
        await Linking.openURL(document.linkPdf);
      } else {
        Alert.alert('Errore', 'Impossibile aprire il documento');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Errore', 'Errore durante l\'apertura del documento');
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleOpenPdf}>
      <View style={styles.iconContainer}>
        <IconSymbol name="doc.text.fill" size={32} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>{document.descrizione}</Text>
        <View style={styles.footer}>
          <IconSymbol name="arrow.down.circle" size={16} color={colors.secondary} />
          <Text style={styles.actionText}>Visualizza/Scarica</Text>
        </View>
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
});
