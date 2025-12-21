import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useAuth } from './src/hooks/useAuth';

export default function App() {
  const { authState, login, logout, startOnboarding, completeOnboarding } = useAuth();

  console.log('App - authState:', authState);

  if (authState === 'checking') {
    return (
      <>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
        <StatusBar style="auto" />
      </>
    );
  }

  if (authState === 'onboarding') {
    return (
      <>
        <OnboardingScreen onComplete={completeOnboarding} />
        <StatusBar style="auto" />
      </>
    );
  }

  if (authState === 'loggedIn') {
    return (
      <>
        <DashboardScreen onLogout={logout} />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <LoginScreen
        onLoginSuccess={login}
        onShowOnboarding={startOnboarding}
      />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
