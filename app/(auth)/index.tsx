import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Music, User, Mic2 } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Music size={80} color="#ea2745" />
          <Text style={styles.title}>Welcome to Music App</Text>
          <Text style={styles.subtitle}>Choose how you want to continue</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => router.push('/(auth)/user/login')}>
            <View style={styles.iconContainer}>
              <User size={48} color="#ea2745" />
            </View>
            <Text style={styles.optionTitle}>Music Listener</Text>
            <Text style={styles.optionDescription}>
              Discover and stream music from your favorite artists
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => router.push('/(auth)/artist/login')}>
            <View style={styles.iconContainer}>
              <Mic2 size={48} color="#ea2745" />
            </View>
            <Text style={styles.optionTitle}>Artist / Label</Text>
            <Text style={styles.optionDescription}>
              Upload and manage your music, build your audience
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ea274520',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
