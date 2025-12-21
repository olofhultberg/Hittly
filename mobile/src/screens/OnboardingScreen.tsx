import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { createFirstSpace, skipOnboarding } from '../lib/onboarding/onboarding';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [spaceName, setSpaceName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSpace = async () => {
    if (!spaceName.trim()) {
      Alert.alert('Fel', 'Ange ett namn för ditt första utrymme');
      return;
    }

    setLoading(true);
    try {
      await createFirstSpace(spaceName.trim());
      setLoading(false);
      onComplete();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Fel', error.message || 'Kunde inte skapa utrymme');
    }
  };

  const handleSkip = async () => {
    try {
      await skipOnboarding();
      onComplete();
    } catch (error: any) {
      Alert.alert('Fel', error.message || 'Kunde inte hoppa över onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Välkommen till GrejFinder!</Text>
        <Text style={styles.subtitle}>
          För att komma igång, skapa ditt första utrymme där du kan organisera dina grejer.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Namn på utrymme</Text>
          <TextInput
            style={styles.input}
            placeholder="t.ex. Vinden, Förråd, Källare"
            value={spaceName}
            onChangeText={setSpaceName}
            autoFocus
            editable={!loading}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Skapa utrymme"
              onPress={handleCreateSpace}
              loading={loading}
              disabled={!spaceName.trim()}
            />
            <Button
              title="Hoppa över"
              onPress={handleSkip}
              variant="ghost"
              disabled={loading}
            />
          </View>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 12,
  },
});

