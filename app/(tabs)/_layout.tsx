import { Tabs, useSegments } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Search, House, User } from 'lucide-react-native';
import MiniPlayer from '@/components/MiniPlayer';

export default function TabLayout() {
  const segments = useSegments();
  const isPlayerScreen = segments[segments.length - 2] === 'player';

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#ea2745',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#333333',
          },
        }}
      >
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
          name="artist/[id]"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="player/[albumId]"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {!isPlayerScreen && (
        <View style={styles.miniPlayerContainer}>
          <MiniPlayer />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 48, 
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
