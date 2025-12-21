import { View, StyleSheet } from 'react-native';
import { LogoLarge } from '../components/Logo';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <LogoLarge />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

