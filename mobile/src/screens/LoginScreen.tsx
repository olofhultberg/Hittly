import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/Button';
import { login, register } from '../lib/auth/auth';
import { shouldShowOnboarding } from '../lib/onboarding/onboarding';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onShowOnboarding: () => void;
}

export function LoginScreen({ onLoginSuccess, onShowOnboarding }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const showOnboarding = await shouldShowOnboarding();
      if (showOnboarding) {
        onShowOnboarding();
      }
    } catch (error) {
      // Ignorera fel vid första kontroll
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('E-post och lösenord är obligatoriskt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // Registrera ny användare
        await register(email.trim(), password);
        setEmail('');
        setPassword('');
        setLoading(false);
        Alert.alert('Registrering lyckades', 'Du kan nu logga in', [
          { text: 'OK', onPress: () => setIsRegistering(false) }
        ]);
      } else {
        // Logga in
        await login(email.trim(), password);
        setEmail('');
        setPassword('');
        setLoading(false);
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScreenHeader
        title={isRegistering ? 'Registrera' : 'Logga in'}
        description={isRegistering
          ? 'Skapa ett konto för att komma igång'
          : 'Ange dina inloggningsuppgifter'}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>E-post</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="din@epost.se"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>Lösenord</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Minst 8 tecken"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              title={isRegistering ? 'Registrera' : 'Logga in'}
              onPress={handleSubmit}
              disabled={loading || !email.trim() || !password.trim()}
              style={styles.submitButton}
            />

            <Button
              title={isRegistering ? 'Har redan konto? Logga in' : 'Ingen konto? Registrera'}
              onPress={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              variant="text"
              disabled={loading}
              style={styles.toggleButton}
            />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
  },
  toggleButton: {
    marginTop: 16,
  },
});

