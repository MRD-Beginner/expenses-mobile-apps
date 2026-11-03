import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { formatCurrency, parseCleanNumber } from '../utils/currency';

export default function BudgetModal({ visible, currentBudget, onClose, onSave }) {
  const [amountStr, setAmountStr] = useState('');

  useEffect(() => {
    if (visible) {
      setAmountStr(currentBudget ? currentBudget.toString() : '3500000');
    }
  }, [visible, currentBudget]);

  const handleAmountChange = (text) => {
    const num = parseCleanNumber(text);
    setAmountStr(num > 0 ? num.toString() : '');
  };

  const handleSave = () => {
    const num = Number(amountStr);
    if (num > 0) {
      onSave(num);
      onClose();
    }
  };

  const displayAmount = amountStr ? formatCurrency(amountStr, true) : 'Rp 0';

  const quickPresets = [1500000, 3000000, 5000000, 10000000];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="wallet" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Atur Batas Anggaran</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Tentukan batas maksimal pengeluaran Anda per bulan untuk memantau keuangan.
          </Text>

          <View style={styles.amountDisplayWrap}>
            <Text style={styles.amountLabel}>Batas Anggaran Bulanan</Text>
            <Text style={styles.amountValue}>{displayAmount}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ketik angka (cth: 3000000)"
              placeholderTextColor={COLORS.textMuted}
              value={amountStr}
              onChangeText={handleAmountChange}
              autoFocus={true}
            />
          </View>

          {/* Quick presets */}
          <Text style={styles.presetLabel}>Pilihan Cepat:</Text>
          <View style={styles.presetRow}>
            {quickPresets.map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.presetBtn,
                  Number(amountStr) === val && styles.presetBtnActive,
                ]}
                onPress={() => setAmountStr(val.toString())}
              >
                <Text
                  style={[
                    styles.presetText,
                    Number(amountStr) === val && styles.presetTextActive,
                  ]}
                >
                  {val >= 1000000 ? `${val / 1000000} Juta` : `${val / 1000} Rb`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  desc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  amountDisplayWrap: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 6,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

