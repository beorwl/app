import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Music, Search, Library, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Music App</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <LogOut size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
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
            tabBarIcon: ({ size, color }) => (
              <Library size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ size, color }) => (
              <Search size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="player"
          options={{
            title: 'Player',
            tabBarIcon: ({ size, color }) => (
              <Music size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userEmail: {
    fontSize: 12,
    color: '#8E8E93',
  },
  logoutButton: {
    padding: 4,
  },
});
