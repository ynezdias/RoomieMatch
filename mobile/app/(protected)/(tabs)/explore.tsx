import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { useEffect, useState } from 'react'
import api from '../../../services/api'
import { Ionicons } from '@expo/vector-icons'

export default function ExploreScreen() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await api.get('/api/profile/explore')
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
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Explore</Text>

      {/* SEARCH BAR */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput
          placeholder="Search by name, city, university"
          placeholderTextColor="#6b7280"
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
          <TouchableOpacity style={styles.card}>
            <Image
              source={{
                uri:
                  item.photo ||
                  `https://ui-avatars.com/api/?name=${item.userId?.name}`,
              }}
              style={styles.avatar}
            />

            <View style={styles.info}>
              <Text style={styles.name}>{item.userId?.name}</Text>
              <Text style={styles.meta}>
                {item.university} • {item.city}
              </Text>

              <Text style={styles.about} numberOfLines={3}>
                {item.aboutMe}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#374151"
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No profiles found</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1f2937',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  meta: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
  about: {
    fontSize: 13,
    color: '#d1d5db',
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#6b7280',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0b0b0f',
  },
})
