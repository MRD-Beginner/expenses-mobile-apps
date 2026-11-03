import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../utils/currency';
import { formatDateIndonesian } from '../utils/date';

export default function TransactionItem({ item, onDelete, onEdit }) {
  const category = DEFAULT_CATEGORIES.find((c) => c.id === item.categoryId) || {
    name: 'Lainnya',
    icon: 'wallet-outline',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  };

  const confirmDelete = () => {
    Alert.alert(
      'Hapus Pengeluaran',
      `Yakin ingin menghapus catatan "${item.notes}" sebesar ${formatCurrency(item.amount)}?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  const paymentLabel = {
    cash: 'Tunai',
    qris: 'QRIS',
    transfer: 'Transfer',
    other: 'Lainnya',
  }[item.paymentMethod] || 'Tunai';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onEdit && onEdit(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: category.bgColor }]}>
        <Ionicons name={category.icon} size={22} color={category.color} />
      </View>

      <View style={styles.details}>
        <Text style={styles.notes} numberOfLines={1}>
          {item.notes}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.categoryBadge}>{category.name}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.paymentTag}>{paymentLabel}</Text>
        </View>
        <Text style={styles.date}>{formatDateIndonesian(item.date)}</Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.amount}>-{formatCurrency(item.amount)}</Text>
        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            onPress={() => onEdit && onEdit(item)}
            style={styles.actionIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDelete}
            style={styles.actionIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  notes: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryBadge: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dot: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginHorizontal: 4,
  },
  paymentTag: {
    fontSize: 10,
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '600',
  },
  date: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 44,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBtn: {
    padding: 2,
  },
});
