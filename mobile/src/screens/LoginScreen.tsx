import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Logo } from '../components/Logo';
import { PinInput } from '../components/PinInput';
import { Button } from '../components/Button';
import { validatePin, getUser, createUser } from '../lib/auth/auth';
import { shouldShowOnboarding } from '../lib/onboarding/onboarding';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onShowOnboarding: () => void;
}

export function LoginScreen({ onLoginSuccess, onShowOnboarding }: LoginScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const user = await getUser();
      const showOnboarding = await shouldShowOnboarding();
      
      if (!user) {
        setIsFirstTime(true);
      } else if (showOnboarding) {
        onShowOnboarding();
      }
    } catch (error) {
      // Ignorera fel vid första kontroll
    }
  };

  const handlePinComplete = async () => {
    if (pin.length !== 4) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isFirstTime) {
        // Skapa ny användare
        await createUser(pin);
        setPin('');
        setLoading(false);
        onShowOnboarding();
      } else {
        // Validera PIN
        const isValid = await validatePin(pin);
        if (isValid) {
          setPin('');
          setLoading(false);
          onLoginSuccess();
        } else {
          setError('Felaktigt PIN');
          setPin('');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod');
      setPin('');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      handlePinComplete();
    }
  }, [pin]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>
          {isFirstTime ? 'Skapa PIN' : 'Logga in'}
        </Text>
        <Text style={styles.subtitle}>
          {isFirstTime
            ? 'Välj ett 4-siffrigt PIN för att skydda dina grejer'
            : 'Ange ditt 4-siffriga PIN'}
        </Text>

        <View style={styles.pinContainer}>
          <PinInput pin={pin} onPinChange={setPin} error={error} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 48,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pinContainer: {
    width: '100%',
    maxWidth: 400,
  },
});

