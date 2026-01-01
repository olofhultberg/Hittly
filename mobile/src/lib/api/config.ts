/**
 * API-konfiguration för backend-anslutning
 */

import { Platform } from 'react-native';

// Hämta datorns IP-adress för fysisk enhet
// Uppdatera denna med din datorns IP-adress om den ändras
// För att hitta din IP: ifconfig (Mac/Linux) eller ipconfig (Windows)
const DEVICE_IP = '192.168.68.102'; // Uppdatera detta med din datorns IP-adress

// Bestäm API base URL baserat på plattform
// - Web och simulator: använd localhost (fungerar lokalt)
// - Fysisk enhet: använd datorns IP-adress (telefonen behöver nätverksanslutning)
const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // För web och simulator, använd localhost
    if (Platform.OS === 'web') {
      return 'http://localhost:5048';
    }
    
    // För fysisk enhet (iOS/Android), använd datorns IP-adress
    // Telefonen och datorn måste vara på samma WiFi-nätverk
    return `http://${DEVICE_IP}:5048`;
  }
  
  // För produktion, använd produktions-URL
  return 'https://api.hittly.se'; // Uppdatera med din produktions-URL
};

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  timeout: 10000, // 10 sekunder
};

export default API_CONFIG;


