import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/providers/AuthProvider';
import { Button } from '../../src/components/ui/Button';
import { colors } from '../../src/utils/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!badgeNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter badge number and password');
      return;
    }

    setLoading(true);
    try {
      await login({ badgeNumber: badgeNumber.trim(), password });
      router.replace('/(tabs)');
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>KALER</Text>
          <Text style={styles.subtitle}>Emergency Alert System</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Badge Number</Text>
          <TextInput
            style={styles.input}
            value={badgeNumber}
            onChangeText={setBadgeNumber}
            placeholder="Enter badge number"
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="large"
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[300],
    marginTop: 8,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.gray[50],
  },
});
