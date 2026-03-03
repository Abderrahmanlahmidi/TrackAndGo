import FontAwesome from '@expo/vector-icons/FontAwesome';
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

import { formatApiError, loginDriver } from '@/lib/driversAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const rawPassword = password.trim();

    if (!normalizedEmail || !rawPassword) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const driver = await loginDriver(normalizedEmail, rawPassword);

      if (!driver) {
        Alert.alert('Login failed', 'Email or password is incorrect.');
        return;
      }

      Alert.alert('Login successful', `Welcome back, ${driver.name}.`, [
        { text: 'Continue', onPress: () => router.replace('/dashboard') },
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
      <View
        className="pointer-events-none absolute -top-[90px] -left-[60px] h-[240px] w-[240px] rounded-full bg-sky-100 opacity-90"
      />
      <View
        className="pointer-events-none absolute -bottom-[40px] -right-[40px] h-[160px] w-[160px] rounded-full bg-blue-100 opacity-85"
      />

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
          <Text className="mt-3 text-[28px] font-bold text-slate-900">Welcome back</Text>
          <Text className="mt-2 text-[15px] leading-[22px] text-slate-600">
            Sign in to manage routes, drivers, and deliveries.
          </Text>

          <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
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
              placeholder="Enter your password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              className="mb-4 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-[15px] text-slate-900"
            />

            <Pressable
              className="mb-4 self-end"
              onPress={() => Alert.alert('Coming soon', 'Forgot password is not implemented yet.')}
            >
              <Text className="font-semibold text-sky-500">Forgot password?</Text>
            </Pressable>

            <Pressable
              className="items-center rounded-2xl border border-sky-400 bg-sky-600 py-4 shadow-lg"
              style={({ pressed }) => [
                { opacity: pressed || isSubmitting ? 0.9 : 1 },
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
              onPress={handleSignIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#f8fafc" />
              ) : (
                <Text className="text-[16px] font-bold tracking-[0.6px] text-slate-50">
                  Sign in
                </Text>
              )}
            </Pressable>

            <View className="my-4 flex-row items-center">
              <View className="h-px flex-1 bg-slate-200" />
              <Text className="mx-2.5 text-xs uppercase tracking-[2px] text-slate-400">
                or
              </Text>
              <View className="h-px flex-1 bg-slate-200" />
            </View>

            <Pressable
              className="items-center rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-md"
              style={({ pressed }) => [
                { opacity: pressed ? 0.9 : 1 },
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
              onPress={() => {}}
            >
              <View className="flex-row items-center">
                <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                  <FontAwesome name="google" size={18} color="#ea4335" />
                </View>
                <Text className="font-semibold text-slate-900">Continue with Google</Text>
              </View>
            </Pressable>
          </View>

          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-slate-600">New to TrackAndGo?</Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text className="ml-1.5 font-semibold text-sky-500">Create an account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
