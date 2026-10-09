import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import { useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import api from '@/services/api'
import ProfileOverlay from '@/components/ui/profile-overlay'
import { EmptyState } from '@/components/app-ui'
import { palette as p, displayFont } from '@/constants/design'
export default function ExploreScreen() {
  const { width } = useWindowDimensions()
  const columns = width >= 1100 ? 3 : width >= 700 ? 2 : 1
  const [profiles, setProfiles] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/profile/explore')
      setProfiles(res.data)
    } catch {
      setError('Could not load profiles. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])
  const q = search.trim().toLowerCase()
  const filtered = profiles.filter((profile) =>
    [profile.userId?.name, profile.city, profile.university].some((value) =>
      value?.toLowerCase().includes(q),
    ),
  )
  return (
    <View style={s.page}>
      <View style={s.frame}>
        <Text style={s.eyebrow}>GOOD PEOPLE. NEW POSSIBILITIES.</Text>
        <Text style={s.title}>Meet your future roommate.</Text>
        <View style={s.search}>
          <Ionicons name="search-outline" size={21} color={p.muted} />
          <TextInput
            accessibilityLabel="Search profiles"
            placeholder="Search by name, city, university"
            placeholderTextColor={p.muted}
            value={search}
            onChangeText={setSearch}
            style={s.input}
          />
        </View>
        <Text style={s.count}>
          {filtered.length} {filtered.length === 1 ? 'person' : 'people'} to get to know
        </Text>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={p.primary} />
        ) : error ? (
          <EmptyState
            title="Let’s try that again"
            description={error}
            action="Try again"
            onAction={load}
          />
        ) : (
          <FlatList
            key={columns}
            numColumns={columns}
            data={filtered}
            keyExtractor={(item) => item._id}
            columnWrapperStyle={columns > 1 ? { gap: 20 } : undefined}
            contentContainerStyle={{ paddingBottom: 30, gap: 20 }}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={'View ' + item.userId?.name}
                onPress={() => setSelected(item)}
                style={[
                  s.card,
                  { flex: 1, maxWidth: columns > 1 ? ((100 / columns + '%') as any) : '100%' },
                ]}
              >
                <Image
                  source={{ uri: item.photo }}
                  style={s.photo}
                  contentFit="cover"
                  contentPosition="top"
                />
                <View style={s.details}>
                  <View style={s.row}>
                    <Text style={s.name}>{item.userId?.name}</Text>
                    <Ionicons name="arrow-forward" size={20} color={p.primary} />
                  </View>
                  <Text style={s.city}>
                    {item.city}
                    {item.state ? ', ' + item.state : ''}
                  </Text>
                  <Text style={s.about} numberOfLines={2}>
                    {item.aboutMe}
                  </Text>
                  <View style={s.footer}>
                    <Text style={s.budget}>
                      $ {Number(item.budget || 0).toLocaleString()}{' '}
                      <Text style={s.month}>/ month</Text>
                    </Text>
                    <Text style={s.tag}>Looking for a roommate</Text>
                  </View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <EmptyState
                title="No one here just yet"
                description="Try another name, city or university."
              />
            }
          />
        )}
      </View>
      <ProfileOverlay visible={!!selected} profile={selected} onClose={() => setSelected(null)} />
    </View>
  )
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: p.canvas },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 26,
  },
  eyebrow: { fontFamily: displayFont, fontSize: 11, fontWeight: '700', color: p.accent, letterSpacing: 2, marginBottom: 9 },
  title: { fontFamily: displayFont, fontWeight: '700',  fontSize: 36, color: p.ink, marginBottom: 20 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: p.line,
    backgroundColor: p.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  input: { flex: 1, color: p.ink, fontFamily: displayFont, fontSize: 15, paddingVertical: 14 },
  count: { color: p.muted, fontFamily: displayFont, fontSize: 13, marginVertical: 18 },
  card: {
    backgroundColor: p.surface,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: p.line,
  },
  photo: { width: '100%', aspectRatio: 1.25, backgroundColor: p.sage },
  details: { padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { fontFamily: displayFont, fontWeight: '700',  fontSize: 24, color: p.ink, flex: 1 },
  city: { color: p.accent, fontFamily: displayFont, fontSize: 13, marginTop: 6 },
  about: { fontFamily: displayFont, fontSize: 14, color: p.muted, lineHeight: 21, marginVertical: 14, minHeight: 42 },
  footer: { borderTopWidth: 1, borderColor: p.line, paddingTop: 14, gap: 8 },
  budget: { color: p.ink, fontWeight: '700', fontFamily: displayFont, fontSize: 17 },
  month: { color: p.muted, fontWeight: '400', fontFamily: displayFont, fontSize: 12 },
  tag: {
    color: p.ink,
    backgroundColor: p.sage,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    fontFamily: displayFont, fontSize: 11,
  },
})
