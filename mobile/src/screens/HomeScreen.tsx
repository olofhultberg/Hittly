import { View, Text, StyleSheet } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Välkommen till Findly"
        description="Hitta grejerna. Håll ordning."
      />
      <View style={styles.content}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
});

