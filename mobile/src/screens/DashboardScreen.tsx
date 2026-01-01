import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/Button';
import { getAllSpaces, createSpace } from '../lib/spaces/spaces';
import { getBoxCount } from '../lib/boxes/boxes';
import { getItemCount } from '../lib/items/items';
import { clearUsers } from '../lib/db/database';
import { useState, useEffect, useCallback } from 'react';

interface DashboardScreenProps {
  onLogout: () => void;
  onSpaceSelect?: (spaceId: number) => void;
  onSearch?: () => void;
}

export function DashboardScreen({ onLogout, onSpaceSelect, onSearch }: DashboardScreenProps) {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [boxCount, setBoxCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allSpaces, boxes, items] = await Promise.all([
        getAllSpaces(),
        getBoxCount(),
        getItemCount(),
      ]);
      setSpaces(allSpaces);
      setBoxCount(boxes);
      setItemCount(items);
    } catch (error) {
      console.error('Kunde inte ladda data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateSpace = async () => {
    if (!spaceName.trim()) {
      Alert.alert('Fel', 'Ange ett namn för utrymmet');
      return;
    }

    setCreating(true);
    try {
      await createSpace(spaceName.trim());
      setSpaceName('');
      setShowAddModal(false);
      await loadData();
    } catch (error: any) {
      Alert.alert('Fel', error.message || 'Kunde inte skapa utrymme');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Dashboard"
        description="Översikt över dina grejer"
        rightAction={
          <View style={styles.headerRight}>
            <Button
              title="🔍"
              onPress={() => onSearch?.()}
              variant="ghost"
            />
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                Alert.alert(
                  'Logga ut',
                  'Är du säker på att du vill logga ut?',
                  [
                    { text: 'Avbryt', style: 'cancel' },
                    { text: 'Logga ut', style: 'destructive', onPress: onLogout },
                  ]
                );
              }}
            >
              <Feather name="log-out" size={20} color="#A855F7" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Mina platser</Text>

        {loading ? (
          <Text style={styles.emptyText}>Laddar...</Text>
        ) : spaces.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Inga utrymmen ännu</Text>
            <Text style={styles.emptySubtext}>
              Skapa ditt första utrymme genom att klicka på plus-tecknet nere i höger hörne för att komma igång
            </Text>
          </View>
        ) : (
          <View style={styles.spacesList}>
            {spaces.map((space) => (
              <TouchableOpacity
                key={space.id}
                style={styles.spaceCard}
                onPress={() => onSpaceSelect?.(space.id)}
              >
                <Text style={styles.spaceName}>{space.name}</Text>
                <Text style={styles.spaceDate}>
                  Skapad: {new Date(space.createdAt || space.created_at || Date.now()).toLocaleDateString('sv-SE')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{spaces.length}</Text>
            <Text style={styles.statLabel}>Utrymmen</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{boxCount}</Text>
            <Text style={styles.statLabel}>Lådor</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{itemCount}</Text>
            <Text style={styles.statLabel}>Saker</Text>
          </View>
        </View>

        <View style={styles.debugSection}>
          <Button
            title="Återställ PIN (Test)"
            onPress={() => {
              Alert.alert(
                'Återställ PIN',
                'Detta kommer radera din användare och alla data. Är du säker?',
                [
                  { text: 'Avbryt', style: 'cancel' },
                  {
                    text: 'Återställ',
                    style: 'destructive',
                    onPress: () => {
                      try {
                        clearUsers();
                        Alert.alert('Klart', 'PIN återställt. Starta om appen för att skapa ny PIN.', [
                          { text: 'OK', onPress: onLogout },
                        ]);
                      } catch (error) {
                        Alert.alert('Fel', 'Kunde inte återställa PIN');
                      }
                    },
                  },
                ]
              );
            }}
            variant="ghost"
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal för att skapa utrymme */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Skapa nytt utrymme</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setSpaceName('');
              }}
            >
              <Text style={styles.modalClose}>Stäng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formGroup}>
              <Text style={styles.label}>Namn på utrymme</Text>
              <TextInput
                style={styles.input}
                placeholder="t.ex. Vinden, Förråd, Källare"
                value={spaceName}
                onChangeText={setSpaceName}
                autoFocus
                editable={!creating}
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Skapa utrymme"
                onPress={handleCreateSpace}
                loading={creating}
                disabled={!spaceName.trim()}
              />
              <Button
                title="Avbryt"
                onPress={() => {
                  setShowAddModal(false);
                  setSpaceName('');
                }}
                variant="ghost"
                disabled={creating}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  logoutButton: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A855F7',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  spacesList: {
    gap: 12,
    marginBottom: 24,
  },
  spaceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  spaceDate: {
    fontSize: 14,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#A855F7',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  debugSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalClose: {
    fontSize: 16,
    color: '#A855F7',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  modalButtons: {
    gap: 12,
    marginTop: 24,
  },
});

