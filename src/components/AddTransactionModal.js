import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, PAYMENT_METHODS } from '../constants/theme';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { formatCurrency, parseCleanNumber } from '../utils/currency';

export default function AddTransactionModal({
  visible,
  onClose,
  onSave,
  editingTransaction = null,
}) {
  const [rawAmount, setRawAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORIES[0].id);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
  const [notes, setNotes] = useState('');

  // Sync state when opening for edit or new
  useEffect(() => {
    if (visible) {
      if (editingTransaction) {
        setRawAmount(editingTransaction.amount ? editingTransaction.amount.toString() : '');
        setSelectedCategory(editingTransaction.categoryId || DEFAULT_CATEGORIES[0].id);
        setSelectedPayment(editingTransaction.paymentMethod || PAYMENT_METHODS[0].id);
        setNotes(editingTransaction.notes || '');
      } else {
        setRawAmount('');
        setSelectedCategory(DEFAULT_CATEGORIES[0].id);
        setSelectedPayment(PAYMENT_METHODS[0].id);
        setNotes('');
      }
    }
  }, [visible, editingTransaction]);

  const handleAmountChange = (text) => {
    const num = parseCleanNumber(text);
    setRawAmount(num > 0 ? num.toString() : '');
  };

  const handleSave = () => {
    const amount = Number(rawAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Perhatian', 'Mohon masukkan nominal pengeluaran yang valid.');
      return;
    }

    const payload = {
      id: editingTransaction ? editingTransaction.id : Date.now().toString(),
      amount,
      categoryId: selectedCategory,
      paymentMethod: selectedPayment,
      notes: notes.trim() || 'Pengeluaran tanpa catatan',
      date: editingTransaction ? editingTransaction.date : new Date().toISOString(),
    };

    onSave(payload, !!editingTransaction);
    onClose();
  };

  const displayAmount = rawAmount ? formatCurrency(rawAmount, true) : 'Rp 0';
  const isEditing = !!editingTransaction;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header Modal */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {isEditing && (
                <View style={[styles.editBadge]}>
                  <Ionicons name="pencil" size={14} color={COLORS.primary} />
                </View>
              )}
              <Text style={styles.modalTitle}>
                {isEditing ? 'Ubah Pengeluaran' : 'Catat Pengeluaran'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Input Nominal */}
            <View style={styles.amountContainer}>
              <Text style={styles.inputLabel}>Nominal Pengeluaran</Text>
              <Text style={styles.amountDisplay}>{displayAmount}</Text>
              <TextInput
                style={styles.hiddenAmountInput}
                keyboardType="numeric"
                placeholder="Ketik jumlah (cth: 50000)"
                placeholderTextColor={COLORS.textMuted}
                value={rawAmount}
                onChangeText={handleAmountChange}
                autoFocus={visible}
              />
            </View>

            {/* Pilihan Kategori */}
            <Text style={styles.sectionLabel}>Pilih Kategori</Text>
            <View style={styles.categoryGrid}>
              {DEFAULT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected && { borderColor: cat.color, backgroundColor: cat.bgColor },
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <View style={[styles.categoryIconWrap, { backgroundColor: cat.color }]}>
                      <Ionicons name={cat.icon} size={20} color="#FFFFFF" />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.categoryText,
                        isSelected && { color: cat.color, fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Pilihan Metode Pembayaran */}
            <Text style={styles.sectionLabel}>Metode Pembayaran</Text>
            <View style={styles.paymentRow}>
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPayment === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentBtn,
                      isSelected && styles.paymentBtnActive,
                    ]}
                    onPress={() => setSelectedPayment(method.id)}
                  >
                    <Ionicons
                      name={method.icon}
                      size={18}
                      color={isSelected ? '#FFFFFF' : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.paymentText,
                        isSelected && styles.paymentTextActive,
                      ]}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Catatan / Keterangan */}
            <Text style={styles.sectionLabel}>Catatan / Keterangan</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Contoh: Makan siang bareng teman"
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
              maxLength={80}
            />

            {/* Tombol Simpan */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons
                name={isEditing ? 'checkmark-done-circle-outline' : 'checkmark-circle-outline'}
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  editBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  amountContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  amountDisplay: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  hiddenAmountInput: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  paymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  paymentBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  paymentTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
