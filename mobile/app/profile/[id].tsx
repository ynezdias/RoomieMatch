import { displayFont } from '@/constants/design'
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

  let data
  try {
    data = typeof profile === 'string' ? JSON.parse(profile) : null
  } catch {
    data = null
  }
  if (!data || typeof data !== 'object') {
    return <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.name}>Back</Text></TouchableOpacity>
      <Text style={styles.about}>This profile could not be loaded. Open it again from Explore.</Text>
    </View>
  }

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
    backgroundColor: '#100E11',
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
    backgroundColor: '#3A3038',
  },
  card: {
    marginTop: -30,
    backgroundColor: '#100E11',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
  },
  name: {
    fontFamily: displayFont, fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  meta: {
    fontFamily: displayFont, fontSize: 14,
    color: '#AEA6AB',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#3A3038',
    marginVertical: 16,
  },
  section: {
    fontFamily: displayFont, fontSize: 16,
    fontWeight: '700',
    color: '#F5EEEE',
    marginBottom: 6,
  },
  about: {
    fontFamily: displayFont, fontSize: 14,
    color: '#AEA6AB',
    lineHeight: 22,
  },
})
