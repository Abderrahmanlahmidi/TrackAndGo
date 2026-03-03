import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-50">
      <View className="pointer-events-none absolute -top-[110px] -right-[80px] h-[250px] w-[250px] rounded-full bg-sky-100 opacity-90" />
      <View className="pointer-events-none absolute -bottom-[50px] -left-[40px] h-[180px] w-[180px] rounded-full bg-blue-100 opacity-80" />

      <ScrollView contentContainerClassName="px-6 pb-12 pt-16" showsVerticalScrollIndicator={false}>
        <Text className="text-[13px] uppercase tracking-[3px] text-slate-900 font-space">
          TrackAndGo
        </Text>
        <Text className="mt-3 text-[30px] font-bold text-slate-900">Driver Dashboard</Text>
        <Text className="mt-2 text-[15px] leading-[22px] text-slate-600">
          Login tsala bnjah. Hadi hiya page li katmchi liha mn baad sign in.
        </Text>

        <View className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Text className="text-base font-bold text-slate-900">Quick actions</Text>
          <Text className="mt-2 text-sm text-slate-600">- Check assigned packages</Text>
          <Text className="mt-1 text-sm text-slate-600">- Start today route</Text>
          <Text className="mt-1 text-sm text-slate-600">- Update delivery status</Text>
        </View>

        <Pressable
          className="mt-6 items-center rounded-2xl border border-slate-300 bg-white py-3.5"
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          onPress={() => router.replace('/login')}
        >
          <Text className="font-semibold text-slate-900">Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
