import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar as RNStatusBar,
  SafeAreaView,
  Platform,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/constants/theme';
import { DEFAULT_CATEGORIES } from './src/constants/categories';
import { formatCurrency, parseCleanNumber } from './src/utils/currency';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  clearAllTransactions,
  getMonthlyBudget,
  setMonthlyBudget,
} from './src/utils/storage';
import TransactionItem from './src/components/TransactionItem';
import AddTransactionModal from './src/components/AddTransactionModal';
import BudgetModal from './src/components/BudgetModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'history' | 'stats' | 'settings'
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(3500000);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  const loadData = async () => {
    try {
      const [txList, budgetLimit] = await Promise.all([
        getTransactions(),
        getMonthlyBudget(),
      ]);
      setTransactions(txList);
      setBudget(budgetLimit);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculations
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayDate = now.getDate();

    let totalMonth = 0;
    let totalToday = 0;
    const categoryTotals = {};

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const amount = Number(tx.amount) || 0;

      // Check current month
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        totalMonth += amount;

        // Check today
        if (txDate.getDate() === todayDate) {
          totalToday += amount;
        }

        // Category breakdown
        categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + amount;
      }
    });

    const budgetPercent = budget > 0 ? Math.min(Math.round((totalMonth / budget) * 100), 100) : 0;
    const remainingBudget = Math.max(budget - totalMonth, 0);

    return {
      totalMonth,
      totalToday,
      budgetPercent,
      remainingBudget,
      categoryTotals,
    };
  }, [transactions, budget]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setModalVisible(true);
  };

  const handleSaveTransaction = async (tx, isEditing) => {
    let updated;
    if (isEditing) {
      updated = await updateTransaction(tx);
    } else {
      updated = await addTransaction(tx);
    }
    setTransactions(updated);
  };

  const handleDeleteTransaction = async (id) => {
    const updated = await deleteTransaction(id);
    setTransactions(updated);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Semua Data',
      'Apakah Anda yakin ingin menghapus semua catatan transaksi pengeluaran? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const updated = await clearAllTransactions();
            setTransactions(updated);
            Alert.alert('Sukses', 'Semua data transaksi telah dihapus.');
          },
        },
      ]
    );
  };

  const handleUpdateBudget = () => {
    setBudgetModalVisible(true);
  };

  const handleSaveBudget = async (newLimit) => {
    try {
      await setMonthlyBudget(newLimit);
      setBudget(newLimit);
      Alert.alert('Sukses', `Batas anggaran bulanan berhasil disimpan: ${formatCurrency(newLimit)}`);
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan anggaran.');
    }
  };

  // Filtered transactions for History tab
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch = tx.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedFilterCategory === 'all' || tx.categoryId === selectedFilterCategory;
      return matchSearch && matchCategory;
    });
  }, [transactions, searchQuery, selectedFilterCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={COLORS.background} />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Catat Pengeluaran</Text>
          <Text style={styles.appSubtitle}>Aplikasi Keuangan Pribadi (Offline)</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtnQuick}
          onPress={handleOpenAdd}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Screen Body */}
      <View style={styles.mainContainer}>
        {/* ===================== TAB 1: BERANDA ===================== */}
        {activeTab === 'home' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Kartu Hero Pengeluaran Bulan Ini */}
            <View style={styles.heroCard}>
              <View style={styles.heroHeaderRow}>
                <Text style={styles.heroLabel}>Total Pengeluaran Bulan Ini</Text>
                <View style={styles.badgeMonth}>
                  <Text style={styles.badgeMonthText}>Bulan Ini</Text>
                </View>
              </View>
              <Text style={styles.heroAmount}>{formatCurrency(stats.totalMonth)}</Text>

              {/* Progress Bar Anggaran */}
              <TouchableOpacity
                style={styles.budgetProgressWrap}
                onPress={handleUpdateBudget}
                activeOpacity={0.8}
              >
                <View style={styles.budgetLabelsRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.budgetSubText}>
                      Limit: {formatCurrency(budget)}
                    </Text>
                    <Ionicons name="pencil" size={12} color="#FFFFFF" />
                  </View>
                  <Text
                    style={[
                      styles.budgetSubText,
                      stats.budgetPercent >= 80 && { color: COLORS.danger, fontWeight: '700' },
                    ]}
                  >
                    Terpakai {stats.budgetPercent}%
                  </Text>
                </View>

                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${stats.budgetPercent}%`,
                        backgroundColor:
                          stats.budgetPercent > 90
                            ? COLORS.danger
                            : stats.budgetPercent > 70
                            ? COLORS.warning
                            : COLORS.primary,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.budgetRemainingText}>
                  Sisa anggaran: <Text style={{ fontWeight: '700', color: COLORS.success }}>{formatCurrency(stats.remainingBudget)}</Text> (Tap untuk ubah)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="today-outline" size={20} color="#D97706" />
                </View>
                <Text style={styles.statLabel}>Hari Ini</Text>
                <Text style={styles.statValue}>{formatCurrency(stats.totalToday)}</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconWrap, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.statLabel}>Total Catatan</Text>
                <Text style={styles.statValue}>{transactions.length} Transaksi</Text>
              </View>
            </View>

            {/* Tombol Catat Cepat */}
            <TouchableOpacity
              style={styles.actionBanner}
              onPress={handleOpenAdd}
            >
              <View style={styles.actionBannerIcon}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.actionBannerText}>
                <Text style={styles.actionBannerTitle}>Catat Pengeluaran Baru</Text>
                <Text style={styles.actionBannerSubtitle}>Klik untuk menambah catatan belanja/makan</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Section Transaksi Terkini */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Transaksi Terkini</Text>
              {transactions.length > 4 && (
                <TouchableOpacity onPress={() => setActiveTab('history')}>
                  <Text style={styles.sectionActionText}>Lihat Semua</Text>
                </TouchableOpacity>
              )}
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="file-tray-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>Belum ada pengeluaran</Text>
                <Text style={styles.emptySubtitle}>
                  Mulai catat pengeluaran harian Anda agar keuangan lebih terkontrol.
                </Text>
              </View>
            ) : (
              transactions.slice(0, 5).map((item) => (
                <TransactionItem
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteTransaction}
                  onEdit={handleOpenEdit}
                />
              ))
            )}
          </ScrollView>
        )}

        {/* ===================== TAB 2: RIWAYAT ===================== */}
        {activeTab === 'history' && (
          <View style={styles.tabContainer}>
            {/* Search Input */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari catatan pengeluaran..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Kategori Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsContainer}
            >
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  selectedFilterCategory === 'all' && styles.filterPillActive,
                ]}
                onPress={() => setSelectedFilterCategory('all')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedFilterCategory === 'all' && styles.filterPillTextActive,
                  ]}
                >
                  Semua
                </Text>
              </TouchableOpacity>

              {DEFAULT_CATEGORIES.map((c) => {
                const isActive = selectedFilterCategory === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.filterPill,
                      isActive && { backgroundColor: c.color, borderColor: c.color },
                    ]}
                    onPress={() => setSelectedFilterCategory(c.id)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive && styles.filterPillTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* List Transaksi */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>Tidak ada transaksi ditemukan</Text>
                  <Text style={styles.emptySubtitle}>
                    Coba ganti kata kunci pencarian atau pilih kategori lain.
                  </Text>
                </View>
              ) : (
                filteredTransactions.map((item) => (
                  <TransactionItem
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteTransaction}
                    onEdit={handleOpenEdit}
                  />
                ))
              )}
            </ScrollView>
          </View>
        )}

        {/* ===================== TAB 3: STATISTIK ===================== */}
        {activeTab === 'stats' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.statsCardSummary}>
              <Text style={styles.statsCardTitle}>Ringkasan Pengeluaran</Text>
              <Text style={styles.statsCardAmount}>{formatCurrency(stats.totalMonth)}</Text>
              <Text style={styles.statsCardSubtitle}>Total pengeluaran tercatat di bulan ini</Text>
            </View>

            <Text style={styles.sectionTitle}>Rincian Berdasarkan Kategori</Text>

            {DEFAULT_CATEGORIES.map((cat) => {
              const amount = stats.categoryTotals[cat.id] || 0;
              const percent = stats.totalMonth > 0 ? Math.round((amount / stats.totalMonth) * 100) : 0;

              return (
                <View key={cat.id} style={styles.categoryStatCard}>
                  <View style={styles.categoryStatHeader}>
                    <View style={styles.categoryStatLeft}>
                      <View style={[styles.catStatIcon, { backgroundColor: cat.bgColor }]}>
                        <Ionicons name={cat.icon} size={20} color={cat.color} />
                      </View>
                      <View>
                        <Text style={styles.catStatName}>{cat.name}</Text>
                        <Text style={styles.catStatPercent}>{percent}% dari total</Text>
                      </View>
                    </View>
                    <Text style={styles.catStatAmount}>{formatCurrency(amount)}</Text>
                  </View>

                  {/* Progress bar visual */}
                  <View style={styles.catProgressBarBg}>
                    <View
                      style={[
                        styles.catProgressBarFill,
                        { width: `${percent}%`, backgroundColor: cat.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* ===================== TAB 4: PENGATURAN ===================== */}
        {activeTab === 'settings' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Anggaran Keuangan</Text>

              <View style={styles.settingsItem}>
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="wallet-outline" size={22} color={COLORS.primary} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.settingsItemTitle}>Limit Anggaran Bulanan</Text>
                    <Text style={styles.settingsItemSubtitle}>
                      {formatCurrency(budget)} per bulan
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editBudgetBtn}
                  onPress={handleUpdateBudget}
                >
                  <Text style={styles.editBudgetBtnText}>Ubah</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Data & Penyimpanan</Text>

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handleResetData}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.settingsItemTitle, { color: COLORS.danger }]}>
                      Reset Semua Data
                    </Text>
                    <Text style={styles.settingsItemSubtitle}>
                      Hapus semua riwayat pengeluaran
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Tentang Aplikasi</Text>

              <View style={styles.aboutCard}>
                <Ionicons name="phone-portrait-outline" size={32} color={COLORS.primary} />
                <Text style={styles.aboutTitle}>Expense Tracker Mobile App</Text>
                <Text style={styles.aboutText}>
                  Aplikasi mobile native yang dibangun dengan JavaScript (React Native & Expo).
                  Semua data tersimpan secara lokal dan aman di perangkat Anda.
                </Text>
                <View style={styles.aboutBadge}>
                  <Text style={styles.aboutBadgeText}>Versi 1.0.0 • Offline Ready</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* ===================== BOTTOM TAB BAR ===================== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'home' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'home' && styles.navTextActive,
            ]}
          >
            Beranda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name={activeTab === 'history' ? 'receipt' : 'receipt-outline'}
            size={22}
            color={activeTab === 'history' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'history' && styles.navTextActive,
            ]}
          >
            Riwayat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('stats')}
        >
          <Ionicons
            name={activeTab === 'stats' ? 'pie-chart' : 'pie-chart-outline'}
            size={22}
            color={activeTab === 'stats' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'stats' && styles.navTextActive,
            ]}
          >
            Statistik
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
            size={22}
            color={activeTab === 'settings' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'settings' && styles.navTextActive,
            ]}
          >
            Pengaturan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Input Transaksi */}
      <AddTransactionModal
        visible={modalVisible}
        editingTransaction={editingTransaction}
        onClose={() => {
          setModalVisible(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
      />

      {/* Modal Atur Budget */}
      <BudgetModal
        visible={budgetModalVisible}
        currentBudget={budget}
        onClose={() => setBudgetModalVisible(false)}
        onSave={handleSaveBudget}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  appSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  addBtnQuick: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  tabContainer: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: 13,
    color: '#E0E7FF',
    fontWeight: '600',
  },
  badgeMonth: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeMonthText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  budgetProgressWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
  },
  budgetLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetSubText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetRemainingText: {
    fontSize: 11,
    color: '#F1F5F9',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    marginBottom: 20,
  },
  actionBannerIcon: {
    marginRight: 12,
  },
  actionBannerText: {
    flex: 1,
  },
  actionBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionBannerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionActionText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  filterPillsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  statsCardSummary: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  statsCardTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  statsCardAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statsCardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  categoryStatCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  categoryStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  catStatName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  catStatPercent: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  catStatAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  catProgressBarBg: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsItem: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  editBudgetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  editBudgetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aboutCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  aboutBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aboutBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
