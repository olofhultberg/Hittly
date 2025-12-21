import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SpaceDetailScreen } from './src/screens/SpaceDetailScreen';
import { BoxDetailScreen } from './src/screens/BoxDetailScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { useAuth } from './src/hooks/useAuth';

export default function App() {
  const { authState, login, logout, startOnboarding, completeOnboarding } = useAuth();
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Visa splash screen i 2 sekunder
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  console.log('App - authState:', authState);

  if (showSplash) {
    return (
      <>
        <SplashScreen />
        <StatusBar style="auto" />
      </>
    );
  }

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
    if (selectedBoxId) {
      return (
        <>
          <BoxDetailScreen
            boxId={selectedBoxId}
            onBack={() => setSelectedBoxId(null)}
          />
          <StatusBar style="auto" />
        </>
      );
    }

    if (selectedSpaceId) {
      return (
        <>
          <SpaceDetailScreen
            spaceId={selectedSpaceId}
            onBack={() => setSelectedSpaceId(null)}
            onBoxSelect={(boxId) => setSelectedBoxId(boxId)}
          />
          <StatusBar style="auto" />
        </>
      );
    }

    return (
      <>
        <DashboardScreen
          onLogout={logout}
          onSpaceSelect={(spaceId) => setSelectedSpaceId(spaceId)}
        />
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
