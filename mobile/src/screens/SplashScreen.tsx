import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogoLarge } from '../components/Logo';

export function SplashScreen() {
  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <LogoLarge />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

