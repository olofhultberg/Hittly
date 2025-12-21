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
import { getBoxesBySpace, createBox, Box } from '../lib/boxes/boxes';
import { getSpace } from '../lib/spaces/spaces';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

interface SpaceDetailScreenProps {
  spaceId: number;
  onBack: () => void;
  onBoxSelect?: (boxId: number) => void;
}

export function SpaceDetailScreen({ spaceId, onBack, onBoxSelect }: SpaceDetailScreenProps) {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [space, setSpace] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [boxName, setBoxName] = useState('');
  const [boxImageUri, setBoxImageUri] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [spaceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const spaceData = await getSpace(spaceId);
      const boxesData = await getBoxesBySpace(spaceId);
      setSpace(spaceData);
      setBoxes(boxesData);
    } catch (error) {
      console.error('Kunde inte ladda data:', error);
      Alert.alert('Fel', 'Kunde inte ladda utrymmet');
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
      ]
    );
  };

  const handleCreateBox = async () => {
    if (!boxName.trim()) {
      Alert.alert('Fel', 'Ange ett namn för lådan');
      return;
    }

    setCreating(true);
    try {
      let finalImageUri = boxImageUri;

      // Kopiera bilden till appens dokumentkatalog om den kommer från temporär katalog
      if (boxImageUri && boxImageUri.startsWith('file://')) {
        const fileName = `box_${Date.now()}.jpg`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: boxImageUri,
          to: newPath,
        });
        finalImageUri = newPath;
      }

      await createBox({
        name: boxName.trim(),
        spaceId,
        imageUri: finalImageUri || null,
      });

      // Återställ formulär
      setBoxName('');
      setBoxImageUri(null);
      setShowAddModal(false);

      // Ladda om lådor
      await loadData();
    } catch (error: any) {
      Alert.alert('Fel', error.message || 'Kunde inte skapa låda');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Tillbaka</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{space?.name || 'Laddar...'}</Text>
          <Text style={styles.headerSubtitle}>Lådor i utrymmet</Text>
        </View>
        <Button
          title="+ Lägg till"
          onPress={() => setShowAddModal(true)}
          variant="primary"
        />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.emptyText}>Laddar...</Text>
        ) : boxes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Inga lådor ännu</Text>
            <Text style={styles.emptySubtext}>
              Lägg till din första låda för att komma igång
            </Text>
          </View>
        ) : (
          <View style={styles.boxesList}>
            {boxes.map((box) => (
              <TouchableOpacity
                key={box.id}
                style={styles.boxCard}
                onPress={() => onBoxSelect?.(box.id)}
              >
                {box.imageUri ? (
                  <Image source={{ uri: box.imageUri }} style={styles.boxImage} />
                ) : (
                  <View style={styles.boxImagePlaceholder}>
                    <Text style={styles.boxImagePlaceholderText}>Ingen bild</Text>
                  </View>
                )}
                <View style={styles.boxInfo}>
                  <Text style={styles.boxName}>{box.name}</Text>
                  <Text style={styles.boxLabelCode}>{box.labelCode}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal för att lägga till låda */}
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
            <Text style={styles.modalTitle}>Lägg till låda</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setBoxName('');
                setBoxImageUri(null);
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
                editable={!creating}
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
                title="Skapa låda"
                onPress={handleCreateBox}
                loading={creating}
                disabled={!boxName.trim()}
              />
              <Button
                title="Avbryt"
                onPress={() => {
                  setShowAddModal(false);
                  setBoxName('');
                  setBoxImageUri(null);
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
  content: {
    flex: 1,
    padding: 20,
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
  boxesList: {
    gap: 16,
  },
  boxCard: {
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
  boxImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
  },
  boxImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxImagePlaceholderText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  boxInfo: {
    padding: 16,
  },
  boxName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  boxLabelCode: {
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
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  input: {
    fontSize: 16,
    color: '#0F172A',
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

