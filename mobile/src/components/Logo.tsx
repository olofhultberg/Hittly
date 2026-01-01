import { View, StyleSheet, Image } from 'react-native';

interface LogoProps {
  withText?: boolean;
}

export function Logo({ withText = true }: LogoProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/hittly-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
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
    color: '#5B21B6',
  },
});

// Export för splash screen med större logo
export const LogoLarge = () => {
  return (
    <View style={largeStyles.container}>
      <Image
        source={require('../../assets/hittly-logo.png')}
        style={largeStyles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
};

const largeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 160,
    height: 160,
  },
});

