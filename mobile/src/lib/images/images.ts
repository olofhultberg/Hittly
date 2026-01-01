/**
 * Bildhantering och bakgrundsborttagning
 */

import { API_CONFIG } from '../api/config';
import * as FileSystem from 'expo-file-system/legacy';

export interface RemoveBackgroundResult {
  success: boolean;
  imageUri?: string;
  error?: string;
}

/**
 * Tar bort bakgrunden från en bild genom att skicka den till backend
 * @param imageUri Lokal URI till bilden som ska bearbetas
 * @returns URI till den bearbetade bilden eller null om det misslyckades
 */
export async function removeBackground(imageUri: string): Promise<string | null> {
  try {
    // Hämta filnamn och typ
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Skapa FormData för React Native
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const response = await fetch(`${API_CONFIG.baseUrl}/api/Image/remove-background`, {
      method: 'POST',
      body: formData,
      // Låt React Native hantera Content-Type automatiskt för FormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fel vid bakgrundsborttagning:', errorText);
      return null;
    }

    // Läs responsen som JSON med base64-bild
    const result = await response.json();
    const base64String = result.image;
    
    if (!base64String) {
      console.error('Ingen bild returnerades från backend');
      return null;
    }
    
    // Spara till lokal fil
    const outputFileName = `item_bg_removed_${Date.now()}.png`;
    const outputPath = `${FileSystem.documentDirectory}${outputFileName}`;
    
    // Konvertera base64-sträng till fil
    await FileSystem.writeAsStringAsync(outputPath, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outputPath;
  } catch (error: any) {
    console.error('Fel vid bakgrundsborttagning:', error);
    return null;
  }
}


