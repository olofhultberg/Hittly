import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { getAllSpaces } from '../lib/spaces/spaces';
import { clearUsers } from '../lib/db/database';
import { useState, useEffect } from 'react';

interface DashboardScreenProps {
  onLogout: () => void;
}

export function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const allSpaces = await getAllSpaces();
      setSpaces(allSpaces);
    } catch (error) {
      console.error('Kunde inte ladda utrymmen:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Översikt över dina grejer</Text>
          </View>
        </View>
        <Button
          title="Logga ut"
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
          variant="secondary"
        />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Mina platser</Text>

        {loading ? (
          <Text style={styles.emptyText}>Laddar...</Text>
        ) : spaces.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Inga utrymmen ännu</Text>
            <Text style={styles.emptySubtext}>
              Skapa ditt första utrymme för att komma igång
            </Text>
          </View>
        ) : (
          <View style={styles.spacesList}>
            {spaces.map((space) => (
              <View key={space.id} style={styles.spaceCard}>
                <Text style={styles.spaceName}>{space.name}</Text>
                <Text style={styles.spaceDate}>
                  Skapad: {new Date(space.created_at).toLocaleDateString('sv-SE')}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{spaces.length}</Text>
            <Text style={styles.statLabel}>Utrymmen</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Lådor</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
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
    color: '#2563EB',
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
});

