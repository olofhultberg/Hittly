import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';
import { Logo } from './Logo';

interface ScreenHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function ScreenHeader({ title, description, onBack, rightAction }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo />
      </View>
      <View style={styles.breadcrumbContainer}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Tillbaka</Text>
          </TouchableOpacity>
        )}
        <View style={styles.breadcrumbTextContainer}>
          <Text style={styles.breadcrumbTitle} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          {description && (
            <Text style={styles.breadcrumbDescription} numberOfLines={1} ellipsizeMode="tail">
              {description}
            </Text>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  logoContainer: {
    marginBottom: 16,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#A855F7',
    fontWeight: '500',
  },
  breadcrumbTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  breadcrumbTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  breadcrumbDescription: {
    fontSize: 13,
    color: '#64748B',
  },
  rightAction: {
    marginLeft: 'auto',
  },
});

