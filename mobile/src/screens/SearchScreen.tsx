import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '../components/Button';
import { searchItems, SearchFilters } from '../lib/search/search';
import { Item } from '../lib/items/items';
import { getAllSpaces } from '../lib/spaces/spaces';
import { getAllBoxes } from '../lib/boxes/boxes';
import { getBox } from '../lib/boxes/boxes';
import { getSpace } from '../lib/spaces/spaces';

interface SearchScreenProps {
  onBack: () => void;
  onItemSelect?: (item: Item) => void;
}

export function SearchScreen({ onBack, onItemSelect }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [boxes, setBoxes] = useState<any[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | undefined>();
  const [selectedBoxId, setSelectedBoxId] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery, selectedSpaceId, selectedBoxId]);

  const loadFilters = async () => {
    try {
      const [allSpaces, allBoxes] = await Promise.all([
        getAllSpaces(),
        getAllBoxes(),
      ]);
      setSpaces(allSpaces);
      setBoxes(allBoxes);
    } catch (error) {
      console.error('Kunde inte ladda filter:', error);
    }
  };

  const performSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const filters: SearchFilters = {};
      if (selectedSpaceId) {
        filters.spaceId = selectedSpaceId;
      }
      if (selectedBoxId) {
        filters.boxId = selectedBoxId;
      }

      const searchResults = await searchItems(searchQuery, filters);
      setResults(searchResults);
    } catch (error) {
      console.error('Sökfel:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSpaceId, selectedBoxId]);

  const handleItemPress = async (item: Item) => {
    if (onItemSelect) {
      onItemSelect(item);
    } else {
      // Om ingen callback finns, navigera till lådan
      const box = await getBox(item.boxId);
      const space = box ? await getSpace(box.spaceId) : null;
      // Här kan vi lägga till navigation till item-detaljer senare
    }
  };

  const clearFilters = () => {
    setSelectedSpaceId(undefined);
    setSelectedBoxId(undefined);
  };

  const filteredBoxes = selectedSpaceId
    ? boxes.filter((b) => b.spaceId === selectedSpaceId)
    : boxes;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Tillbaka</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            Sök
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
            Hitta dina grejer
          </Text>
        </View>
        <Button
          title={showFilters ? 'Dölj filter' : 'Filter'}
          onPress={() => setShowFilters(!showFilters)}
          variant="secondary"
        />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Sök efter grejer..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          returnKeyType="search"
        />
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Utrymme:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  !selectedSpaceId && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedSpaceId(undefined)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    !selectedSpaceId && styles.filterButtonTextActive,
                  ]}
                >
                  Alla
                </Text>
              </TouchableOpacity>
              {spaces.map((space) => (
                <TouchableOpacity
                  key={space.id}
                  style={[
                    styles.filterButton,
                    selectedSpaceId === space.id && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedSpaceId(space.id)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedSpaceId === space.id && styles.filterButtonTextActive,
                    ]}
                  >
                    {space.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Låda:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  !selectedBoxId && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedBoxId(undefined)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    !selectedBoxId && styles.filterButtonTextActive,
                  ]}
                >
                  Alla
                </Text>
              </TouchableOpacity>
              {filteredBoxes.map((box) => (
                <TouchableOpacity
                  key={box.id}
                  style={[
                    styles.filterButton,
                    selectedBoxId === box.id && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedBoxId(box.id)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedBoxId === box.id && styles.filterButtonTextActive,
                    ]}
                  >
                    {box.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {(selectedSpaceId || selectedBoxId) && (
            <Button
              title="Rensa filter"
              onPress={clearFilters}
              variant="ghost"
            />
          )}
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Söker...</Text>
          </View>
        ) : searchQuery.trim().length < 2 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Skriv minst 2 tecken för att söka</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Inga resultat hittades</Text>
            <Text style={styles.emptySubtext}>
              Prova att ändra söktermer eller filter
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {results.length} {results.length === 1 ? 'resultat' : 'resultat'}
            </Text>
            <View style={styles.resultsList}>
              {results.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultCard}
                  onPress={() => handleItemPress(item)}
                >
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.resultImage} />
                  ) : (
                    <View style={styles.resultImagePlaceholder}>
                      <Text style={styles.resultImagePlaceholderText}>Ingen bild</Text>
                    </View>
                  )}
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    {item.description ? (
                      <Text style={styles.resultDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                    {item.tags && item.tags.length > 0 ? (
                      <View style={styles.tagsContainer}>
                        {item.tags.map((tag) => (
                          <View key={tag.id} style={styles.tag}>
                            <Text style={styles.tagText}>{tag.name}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  headerTitleContainer: {
    flex: 1,
    minWidth: 0,
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 16,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  resultsList: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
  },
  resultImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImagePlaceholderText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  resultInfo: {
    padding: 16,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  tagText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
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
});

