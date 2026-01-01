import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScreenHeader
        title="Välkommen till Hittly!"
        description="För att komma igång, skapa ditt första utrymme där du kan organisera dina grejer."
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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

