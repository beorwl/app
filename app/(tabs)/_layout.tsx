import { Tabs, useSegments } from 'expo-router';
import { View } from 'react-native';
import { Search, House, User } from 'lucide-react-native';
import MiniPlayer from '@/components/MiniPlayer';

export default function TabLayout() {
  const segments = useSegments();
  const isPlayerScreen = segments[segments.length - 2] === 'player';

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopColor: '#1C1C1E',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Browse',
            tabBarLabel: () => null,
            tabBarIcon: ({ size, color }) => (
              <House size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarLabel: () => null,
            tabBarIcon: ({ size, color }) => (
              <Search size={size} color={color} />
            ),
          }}
        />

        
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarLabel: () => null,
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="artist"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="player"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
      {!isPlayerScreen && <MiniPlayer />}
    </View>
  );
}
