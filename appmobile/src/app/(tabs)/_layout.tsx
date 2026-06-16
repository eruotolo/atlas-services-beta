import { Tabs } from 'expo-router';
import { SharedTabBar } from '@/shared/components/TabBar';

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <SharedTabBar
          state={props.state}
          navigation={props.navigation as Parameters<typeof SharedTabBar>[0]['navigation']}
        />
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
