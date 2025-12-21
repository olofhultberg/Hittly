import { View, Text, StyleSheet, Image } from 'react-native';

interface LogoProps {
  withText?: boolean;
}

export function Logo({ withText = true }: LogoProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/findly-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      {withText && <Text style={styles.text}>Findly</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
});

// Export för splash screen med större logo
export const LogoLarge = () => {
  return (
    <View style={largeStyles.container}>
      <Image
        source={require('../../assets/findly-logo.png')}
        style={largeStyles.logoImage}
        resizeMode="contain"
      />
      <Text style={largeStyles.text}>Findly</Text>
    </View>
  );
};

const largeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  text: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
  },
});

