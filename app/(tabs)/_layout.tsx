import { Tabs } from 'expo-router';
import { Search, House, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
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
      
      </Tabs>
  );
}
