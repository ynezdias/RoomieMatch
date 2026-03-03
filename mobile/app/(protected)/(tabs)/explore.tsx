import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { useEffect, useState } from 'react'
import api from '../../../services/api'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import ProfileOverlay from '../../../components/ui/profile-overlay'

export default function ExploreScreen() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await api.get('/profile/explore')
        setProfiles(res.data)
        setFiltered(res.data)
      } catch (err) {
        console.log('Explore error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfiles()
  }, [])

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search) {
      setFiltered(profiles)
      return
    }

    const q = search.toLowerCase()
    setFiltered(
      profiles.filter(
        (p) =>
          p.userId?.name?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.university?.toLowerCase().includes(q)
      )
    )
  }, [search, profiles])

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={['#020617', '#0f172a']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#ce0000" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020617', '#0f172a', '#1e293b']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          {/* HEADER */}
          <Text style={styles.title}>Explore</Text>

          {/* SEARCH BAR */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search by name, city, university"
              placeholderTextColor="#64748b"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* LIST */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.card}
                onPress={() => {
                  setSelectedProfile(item)
                  setIsModalVisible(true)
                }}
              >
                <View style={styles.avatarContainer}>
                    <Image
                    source={{
                        uri:
                        item.photo ||
                        `https://ui-avatars.com/api/?name=${item.userId?.name}`,
                    }}
                    style={styles.avatar}
                    />
                </View>

                <View style={styles.info}>
                  <Text style={styles.name}>{item.userId?.name}</Text>
                  <Text style={styles.meta}>
                    {item.university} • {item.city}
                  </Text>

                  <Text style={styles.about} numberOfLines={2}>
                    {item.aboutMe}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#475569"
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No profiles found</Text>
            }
          />
        </View>
      </SafeAreaView>

      <ProfileOverlay
        visible={isModalVisible}
        profile={selectedProfile}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginTop: 20,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#f8fafc',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1e293b',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  meta: {
    fontSize: 14,
    color: '#ce0000',
    fontWeight: '600',
    marginBottom: 4,
  },
  about: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 100,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
})
