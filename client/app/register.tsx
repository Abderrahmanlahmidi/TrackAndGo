import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { findDriverByEmail, formatApiError, registerDriver } from '@/lib/driversAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const rawPassword = password.trim();
    const rawConfirmPassword = confirmPassword.trim();

    if (!normalizedName || !normalizedEmail || !rawPassword || !rawConfirmPassword) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }

    if (rawPassword.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    if (rawPassword !== rawConfirmPassword) {
      Alert.alert('Password mismatch', 'Password and confirm password are different.');
      return;
    }

    setIsSubmitting(true);

    try {
      const existingDriver = await findDriverByEmail(normalizedEmail);

      if (existingDriver) {
        Alert.alert('Email already used', 'Try another email or login directly.');
        return;
      }

      await registerDriver({
        name: normalizedName,
        email: normalizedEmail,
        password: rawPassword,
      });

      Alert.alert('Account created', 'Your account is ready. You can sign in now.', [
        { text: 'Go to login', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      Alert.alert('Request failed', formatApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <View className="pointer-events-none absolute -top-[90px] -right-[60px] h-[240px] w-[240px] rounded-full bg-sky-100 opacity-90" />
      <View className="pointer-events-none absolute -bottom-[40px] -left-[40px] h-[170px] w-[170px] rounded-full bg-blue-100 opacity-85" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="px-6 pb-12 pt-16"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Link href="/" asChild>
            <Pressable
              className="self-start"
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <Text className="font-semibold text-sky-500">Back to home</Text>
            </Pressable>
          </Link>

          <Text className="mt-6 text-[13px] uppercase tracking-[3px] text-slate-900 font-space">
            TrackAndGo
          </Text>
          <Text className="mt-3 text-[28px] font-bold text-slate-900">Create account</Text>
          <Text className="mt-2 text-[15px] leading-[22px] text-slate-600">
            Register as a driver and start using the platform.
          </Text>

          <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
            <Text className="mb-1.5 text-[12px] font-semibold uppercase tracking-[1.2px] text-slate-500">
              Full name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              className="mb-4 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-[15px] text-slate-900"
            />

            <Text className="mb-1.5 text-[12px] font-semibold uppercase tracking-[1.2px] text-slate-500">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@trackandgo.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="mb-4 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-[15px] text-slate-900"
            />

            <Text className="mb-1.5 text-[12px] font-semibold uppercase tracking-[1.2px] text-slate-500">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              className="mb-4 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-[15px] text-slate-900"
            />

            <Text className="mb-1.5 text-[12px] font-semibold uppercase tracking-[1.2px] text-slate-500">
              Confirm password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              className="mb-4 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-[15px] text-slate-900"
            />

            <Pressable
              className="items-center rounded-2xl border border-sky-400 bg-sky-600 py-4 shadow-lg"
              style={({ pressed }) => [
                { opacity: pressed || isSubmitting ? 0.9 : 1 },
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#f8fafc" />
              ) : (
                <Text className="text-[16px] font-bold tracking-[0.6px] text-slate-50">
                  Create account
                </Text>
              )}
            </Pressable>
          </View>

          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-slate-600">Already have an account?</Text>
            <Pressable onPress={() => router.push('/login')}>
              <Text className="ml-1.5 font-semibold text-sky-500">Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
