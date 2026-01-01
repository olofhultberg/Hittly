import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PinInputProps {
  pin: string;
  onPinChange: (pin: string) => void;
  error?: string;
}

export function PinInput({ pin, onPinChange, error }: PinInputProps) {
  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      onPinChange(pin + num);
    }
  };

  const handleDelete = () => {
    onPinChange(pin.slice(0, -1));
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < pin.length && styles.dotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderDots()}
      {error && <Text style={styles.error}>{error}</Text>}
      
      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.key}
            onPress={() => handleNumberPress(num.toString())}
          >
            <Text style={styles.keyText}>{num}</Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.key} />
        
        <TouchableOpacity
          style={styles.key}
          onPress={() => handleNumberPress('0')}
        >
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.key}
          onPress={handleDelete}
          disabled={pin.length === 0}
        >
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#A855F7',
    borderColor: '#A855F7',
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
  },
});

