import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Button } from '../components/Button';
import { getBox, updateBox, Box } from '../lib/boxes/boxes';
import { getItemsByBox, createItem, Item } from '../lib/items/items';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

interface BoxDetailScreenProps {
  boxId: number;
  onBack: () => void;
}

export function BoxDetailScreen({ boxId, onBack }: BoxDetailScreenProps) {
  const [box, setBox] = useState<Box | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [boxName, setBoxName] = useState('');
  const [boxImageUri, setBoxImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [creatingItem, setCreatingItem] = useState(false);

  useEffect(() => {
    loadData();
  }, [boxId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const boxData = await getBox(boxId);
      const itemsData = await getItemsByBox(boxId);
      setBox(boxData);
      setItems(itemsData);
      if (boxData) {
        setBoxName(boxData.name);
        setBoxImageUri(boxData.imageUri || null);
      }
    } catch (error) {
      console.error('Kunde inte ladda data:', error);
      Alert.alert('Fel', 'Kunde inte ladda lådan');
    } finally {
      setLoading(false);
    }
  };

  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Behörighet krävs',
        'Vi behöver tillgång till dina bilder för att kunna spara foto på lådan.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setBoxImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Behörighet krävs',
        'Vi behöver tillgång till kameran för att kunna ta foto på lådan.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setBoxImageUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Välj bild',
      'Hur vill du lägga till bild?',
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Ta foto', onPress: takePhoto },
        { text: 'Välj från bibliotek', onPress: pickImage },
        ...(boxImageUri ? [{ text: 'Ta bort bild', style: 'destructive', onPress: () => setBoxImageUri(null) }] : []),
      ]
    );
  };

  const handleSaveBox = async () => {
    if (!boxName.trim()) {
      Alert.alert('Fel', 'Ange ett namn för lådan');
      return;
    }

    if (!box) return;

    setSaving(true);
    try {
      let finalImageUri = boxImageUri;

      // Kopiera bilden till appens dokumentkatalog om den är ny
      if (boxImageUri && boxImageUri !== box.imageUri && boxImageUri.startsWith('file://')) {
        const fileName = `box_${Date.now()}.jpg`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: boxImageUri,
          to: newPath,
        });
        finalImageUri = newPath;
      }

      await updateBox(boxId, {
        name: boxName.trim(),
        imageUri: finalImageUri || null,
      });

      setShowEditModal(false);
      await loadData();
    } catch (error: any) {
      Alert.alert('Fel', error.message || 'Kunde inte uppdatera låda');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Fel', 'Ange ett namn för grejen');
      return;
    }

    if (!box) return;

    setCreatingItem(true);
    try {
      await createItem({
        name: itemName.trim(),
        description: itemDescription.trim(),
        spaceId: box.spaceId,
        zoneId: box.zoneId || null,
        boxId: box.id,
      });

      setItemName('');
      setItemDescription('');
      setShowAddItemModal(false);
      await loadData();
    } catch (error: any) {
      Alert.alert('Fel', error.message || 'Kunde inte skapa grej');
    } finally {
      setCreatingItem(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Tillbaka</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laddar...</Text>
        </View>
      </View>
    );
  }

  if (!box) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Tillbaka</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Låda hittades inte</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Tillbaka</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{box.name}</Text>
          <Text style={styles.headerSubtitle}>{box.labelCode}</Text>
        </View>
        <Button
          title="Redigera"
          onPress={() => setShowEditModal(true)}
          variant="secondary"
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Lådans bild */}
        <View style={styles.imageSection}>
          {box.imageUri ? (
            <Image source={{ uri: box.imageUri }} style={styles.boxImage} />
          ) : (
            <View style={styles.boxImagePlaceholder}>
              <Text style={styles.boxImagePlaceholderText}>Ingen bild</Text>
            </View>
          )}
        </View>

        {/* Grejer i lådan */}
        <View style={styles.itemsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Grejer ({items.length})</Text>
            <Button
              title="+ Lägg till"
              onPress={() => setShowAddItemModal(true)}
              variant="primary"
            />
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Inga grejer ännu</Text>
              <Text style={styles.emptySubtext}>
                Lägg till din första grej i lådan
              </Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal för att redigera låda */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Redigera låda</Text>
            <TouchableOpacity
              onPress={() => {
                setShowEditModal(false);
                setBoxName(box.name);
                setBoxImageUri(box.imageUri || null);
              }}
            >
              <Text style={styles.modalClose}>Stäng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formGroup}>
              <Text style={styles.label}>Namn på låda</Text>
              <TextInput
                style={styles.input}
                placeholder="Ange namn..."
                value={boxName}
                onChangeText={setBoxName}
                autoFocus
                editable={!saving}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Foto på var lådan är</Text>
              {boxImageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: boxImageUri }} style={styles.imagePreview} />
                  <Button
                    title="Ändra bild"
                    onPress={showImageOptions}
                    variant="secondary"
                  />
                </View>
              ) : (
                <Button
                  title="+ Lägg till foto"
                  onPress={showImageOptions}
                  variant="ghost"
                />
              )}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Spara"
                onPress={handleSaveBox}
                loading={saving}
                disabled={!boxName.trim()}
              />
              <Button
                title="Avbryt"
                onPress={() => {
                  setShowEditModal(false);
                  setBoxName(box.name);
                  setBoxImageUri(box.imageUri || null);
                }}
                variant="ghost"
                disabled={saving}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal för att lägga till grej */}
      <Modal
        visible={showAddItemModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddItemModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lägg till grej</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddItemModal(false);
                setItemName('');
                setItemDescription('');
              }}
            >
              <Text style={styles.modalClose}>Stäng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formGroup}>
              <Text style={styles.label}>Namn på grej</Text>
              <TextInput
                style={styles.input}
                placeholder="Ange namn..."
                value={itemName}
                onChangeText={setItemName}
                autoFocus
                editable={!creatingItem}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Beskrivning (valfritt)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Beskriv grejen..."
                value={itemDescription}
                onChangeText={setItemDescription}
                multiline
                numberOfLines={4}
                editable={!creatingItem}
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Lägg till"
                onPress={handleCreateItem}
                loading={creatingItem}
                disabled={!itemName.trim()}
              />
              <Button
                title="Avbryt"
                onPress={() => {
                  setShowAddItemModal(false);
                  setItemName('');
                  setItemDescription('');
                }}
                variant="ghost"
                disabled={creatingItem}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  boxImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  boxImagePlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxImagePlaceholderText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  itemsSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
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
  itemsList: {
    gap: 12,
  },
  itemCard: {
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
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#64748B',
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
    color: '#2563EB',
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    gap: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  modalButtons: {
    gap: 12,
    marginTop: 24,
  },
});

