import { useMemo, useState } from 'react'
import {
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Fonts } from '@/constants/theme'

/* ================= MOCK DATA ================= */

const PROFILES = [
  {
    id: '1',
    name: 'Alex Johnson',
    university: 'NYU',
    city: 'New York',
    about: 'Quiet, clean, and focused on studies.',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Sophia Lee',
    university: 'UCLA',
    city: 'Los Angeles',
    about: 'Outgoing, loves cooking and movies.',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: 'Daniel Kim',
    university: 'NYU',
    city: 'New York',
    about: 'Tech student, night owl.',
    photo: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
]

const CITIES = ['All', 'New York', 'Los Angeles']

/* ================= SCREEN ================= */

export default function ExploreScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All')

  const filtered = useMemo(() => {
    return PROFILES.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase())

      return matchesSearch && (city === 'All' || p.city === city)
    })
  }, [search, city])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#000', dark: '#000' }}
      headerImage={
        <ThemedText style={styles.headerTitle}>Explore</ThemedText>
      }
    >
      {/* Search */}
      <TextInput
        placeholder="Search by name or city"
        placeholderTextColor="#6b7280"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* Filters */}
      <View style={styles.filters}>
        {CITIES.map((c) => (
          <FilterChip
            key={c}
            label={c}
            selected={city === c}
            onPress={() => setCity(c)}
          />
        ))}
      </View>

      {/* Cards */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/profile/[id]',
                params: item, // ✅ FIXED (no duplicate id)
              })
            }
          >
            <ProfileCard profile={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      />
    </ParallaxScrollView>
  )
}

/* ================= COMPONENTS ================= */

function FilterChip({ label, selected, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.chipActive,
      ]}
    >
      <ThemedText
        style={[
          styles.chipText,
          selected && styles.chipTextActive,
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  )
}

function ProfileCard({ profile }: any) {
  return (
    <ThemedView style={styles.card}>
      <Image source={{ uri: profile.photo }} style={styles.avatar} />

      <View style={styles.cardContent}>
        <ThemedText style={styles.name}>{profile.name}</ThemedText>

        <ThemedText style={styles.meta}>
          {profile.university} • {profile.city}
        </ThemedText>

        <ThemedText numberOfLines={2} style={styles.about}>
          {profile.about}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 36,
    fontFamily: Fonts.rounded,
    fontWeight: '800',
    color: '#fff',
    marginTop: 60,
    marginLeft: 20,
  },

  search: {
    backgroundColor: '#0f172a',
    color: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
  },

  filters: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },

  chip: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  chipText: {
    fontSize: 12,
    color: '#9ca3af',
  },

  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center', // ✅ FIXED ALIGNMENT
    gap: 14,
    backgroundColor: '#020617',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  cardContent: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  meta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },

  about: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 6,
    lineHeight: 18,
  },
})
