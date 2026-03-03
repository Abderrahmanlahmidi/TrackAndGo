import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <View
        className="pointer-events-none absolute -top-[90px] -right-[90px] h-[260px] w-[260px] rounded-full bg-sky-100 opacity-90"
      />
      <View
        className="pointer-events-none absolute -bottom-[60px] -left-[40px] h-[180px] w-[180px] rounded-full bg-blue-100 opacity-85"
      />

      <ScrollView contentContainerClassName="px-6 pb-12 pt-20" showsVerticalScrollIndicator={false}>
        <Text className="text-[14px] uppercase tracking-[3px] text-slate-900 font-space">
          TrackAndGo
        </Text>
        <Text className="mt-4 text-4xl font-bold text-slate-900">
          Move smarter, track everything.
        </Text>
        <Text className="mt-3 text-base leading-6 text-slate-600">
          Real-time tracking for deliveries, rides, and field teams. Plan, monitor, and share
          routes in one place.
        </Text>

        <View className="mt-6 flex-row flex-wrap">
          <Link href="/login" asChild>
            <Pressable
              className="mb-3 mr-3 rounded-[14px] bg-sky-500 px-[22px] py-3.5 shadow-lg"
              style={({ pressed }) => [
                { opacity: pressed ? 0.9 : 1 },
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Text className="text-[15px] font-bold text-white">Sign in</Text>
            </Pressable>
          </Link>
          <Link href="/register" asChild>
            <Pressable
              className="mb-3 rounded-[14px] border border-slate-300 bg-white px-[22px] py-3.5"
              style={({ pressed }) => [
                { opacity: pressed ? 0.9 : 1 },
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Text className="text-[15px] font-semibold text-slate-900">Create account</Text>
            </Pressable>
          </Link>
        </View>

        <View className="mt-8">
          <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Text className="mb-1.5 text-base font-bold text-slate-900">Live map</Text>
            <Text className="text-sm leading-5 text-slate-600">
              Watch vehicles move with second-by-second updates.
            </Text>
          </View>
          <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Text className="mb-1.5 text-base font-bold text-slate-900">Smart alerts</Text>
            <Text className="text-sm leading-5 text-slate-600">
              Get notified when a route changes or a stop is missed.
            </Text>
          </View>
          <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Text className="mb-1.5 text-base font-bold text-slate-900">Team ready</Text>
            <Text className="text-sm leading-5 text-slate-600">
              Assign drivers, share links, and keep everyone in sync.
            </Text>
          </View>
        </View>

        <View className="mt-7 flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 py-4">
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-slate-900">24/7</Text>
            <Text className="mt-1 text-xs uppercase tracking-[1.5px] text-slate-500">
              Visibility
            </Text>
          </View>
          <View className="h-9 w-px bg-slate-200" />
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-slate-900">15s</Text>
            <Text className="mt-1 text-xs uppercase tracking-[1.5px] text-slate-500">
              Refresh
            </Text>
          </View>
          <View className="h-9 w-px bg-slate-200" />
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-slate-900">99.9%</Text>
            <Text className="mt-1 text-xs uppercase tracking-[1.5px] text-slate-500">
              Uptime
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
