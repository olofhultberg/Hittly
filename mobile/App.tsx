import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { useAuth } from './src/hooks/useAuth';

export default function App() {
  const { authState, login, logout, startOnboarding, completeOnboarding } = useAuth();

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
        <HomeScreen />
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
