import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  withText?: boolean;
}

export function Logo({ withText = true }: LogoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📦</Text>
      </View>
      {withText && <Text style={styles.text}>GrejFinder</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
});

