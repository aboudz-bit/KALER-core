import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/providers/AuthProvider';
import { Button } from '../../src/components/ui/Button';
import { colors } from '../../src/utils/colors';
import { haptic } from '../../src/utils/haptics';

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!badgeNumber.trim() || !password.trim()) {
      haptic.error();
      Alert.alert('Error', 'Please enter badge number and password');
      return;
    }

    setLoading(true);
    try {
      await login({ badgeNumber: badgeNumber.trim(), password });
      haptic.success();
      router.replace('/(tabs)');
    } catch (err: any) {
      haptic.error();
      const message =
        err.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable style={styles.inner} onPress={Keyboard.dismiss}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={48} color={colors.white} />
          </View>
          <Text style={styles.title}>KALER</Text>
          <Text style={styles.subtitle}>Emergency Alert System</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Badge Number</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="card-outline"
              size={20}
              color={colors.gray[400]}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={badgeNumber}
              onChangeText={setBadgeNumber}
              placeholder="Enter badge number"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.gray[400]}
              style={styles.inputIcon}
            />
            <TextInput
              ref={passwordRef}
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={colors.gray[400]}
              secureTextEntry={!showPassword}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={12}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.gray[400]}
              />
            </Pressable>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="large"
            style={{ marginTop: 28 }}
          />
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    fontWeight: '500',
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray[600],
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: colors.gray[900],
  },
  eyeButton: {
    padding: 14,
  },
});
