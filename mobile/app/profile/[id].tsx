import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileDetailScreen() {
  const router = useRouter()
  const { profile } = useLocalSearchParams()

  const data = JSON.parse(profile as string)

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <TouchableOpacity
        style={styles.back}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* PHOTO */}
      <Image
        source={{
          uri:
            data.photo ||
            `https://ui-avatars.com/api/?name=${data.userId?.name}`,
        }}
        style={styles.image}
      />

      {/* INFO */}
      <View style={styles.card}>
        <Text style={styles.name}>{data.userId?.name}</Text>

        <Text style={styles.meta}>
          {data.university} • {data.city}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.section}>About</Text>
        <Text style={styles.about}>{data.aboutMe}</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  back: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  image: {
    width: '100%',
    height: 340,
    backgroundColor: '#1f2937',
  },
  card: {
    marginTop: -30,
    backgroundColor: '#0b0b0f',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  meta: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 16,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 6,
  },
  about: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 22,
  },
})
