
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { F24 } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';

interface F24CardProps {
  f24: F24;
  onUpdate: (id: string, updates: Partial<F24>) => void;
}

export default function F24Card({ f24, onUpdate }: F24CardProps) {
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: F24['stato']) => {
    switch (status) {
      case 'Da Pagare':
        return colors.error;
      case 'Pagato':
        return colors.success;
      case 'Rifiutato':
        return colors.textSecondary;
      case 'Pagato Parzialmente':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const handleAccept = () => {
    Alert.alert(
      'Conferma Pagamento',
      `Confermi di aver pagato €${f24.importo.toFixed(2)}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Conferma',
          onPress: () => {
            console.log('Accepting F24:', f24.idF24);
            setLoading(true);
            setTimeout(() => {
              onUpdate(f24.idF24, { stato: 'Pagato' });
              setLoading(false);
              Alert.alert('Successo', 'Pagamento confermato');
            }, 500);
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Conferma Rifiuto',
      'Sei sicuro di voler rifiutare questo pagamento?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rifiuta',
          style: 'destructive',
          onPress: () => {
            console.log('Rejecting F24:', f24.idF24);
            setLoading(true);
            setTimeout(() => {
              onUpdate(f24.idF24, { stato: 'Rifiutato' });
              setLoading(false);
              Alert.alert('Successo', 'Pagamento rifiutato');
            }, 500);
          },
        },
      ]
    );
  };

  const handlePartialPayment = () => {
    const amount = parseFloat(partialAmount);
    if (isNaN(amount) || amount <= 0 || amount >= f24.importo) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return;
    }

    console.log('Partial payment for F24:', f24.idF24, 'Amount:', amount);
    setLoading(true);
    setTimeout(() => {
      onUpdate(f24.idF24, {
        stato: 'Pagato Parzialmente',
        importoPagato: amount,
      });
      setLoading(false);
      setShowPartialModal(false);
      setPartialAmount('');
      Alert.alert('Successo', `Pagamento parziale di €${amount.toFixed(2)} registrato`);
    }, 500);
  };

  const handleOpenPdf = async () => {
    console.log('Opening PDF:', f24.linkPdf);
    try {
      const supported = await Linking.canOpenURL(f24.linkPdf);
      if (supported) {
        await Linking.openURL(f24.linkPdf);
      } else {
        Alert.alert('Errore', 'Impossibile aprire il PDF');
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Errore', 'Errore durante l\'apertura del PDF');
    }
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.description}>{f24.descrizione}</Text>
            <Text style={styles.amount}>€{f24.importo.toFixed(2)}</Text>
            {f24.stato === 'Pagato Parzialmente' && f24.importoPagato && (
              <Text style={styles.partialAmount}>
                Pagato: €{f24.importoPagato.toFixed(2)}
              </Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(f24.stato) }]}>
            <Text style={styles.badgeText}>{f24.stato}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.pdfButton} onPress={handleOpenPdf}>
          <IconSymbol name="doc.fill" size={20} color={colors.primary} />
          <Text style={styles.pdfButtonText}>Apri PDF</Text>
        </TouchableOpacity>

        {f24.stato === 'Da Pagare' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.card} />
              ) : (
                <>
                  <IconSymbol name="checkmark" size={18} color={colors.card} />
                  <Text style={styles.actionButtonText}>Accetta</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={loading}
            >
              <IconSymbol name="xmark" size={18} color={colors.card} />
              <Text style={styles.actionButtonText}>Rifiuta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.partialButton]}
              onPress={() => setShowPartialModal(true)}
              disabled={loading}
            >
              <IconSymbol name="percent" size={18} color={colors.card} />
              <Text style={styles.actionButtonText}>Parziale</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showPartialModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPartialModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pagamento Parziale</Text>
            <Text style={styles.modalSubtitle}>
              Importo totale: €{f24.importo.toFixed(2)}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Importo pagato"
              placeholderTextColor={colors.textSecondary}
              value={partialAmount}
              onChangeText={setPartialAmount}
              keyboardType="decimal-pad"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[buttonStyles.outline, styles.modalButton]}
                onPress={() => {
                  setShowPartialModal(false);
                  setPartialAmount('');
                }}
              >
                <Text style={buttonStyles.textOutline}>Annulla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.primary, styles.modalButton]}
                onPress={handlePartialPayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.card} />
                ) : (
                  <Text style={buttonStyles.text}>Conferma</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  partialAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  pdfButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  partialButton: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
