import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { useState, useCallback } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import api from '@/services/api'
import { EmptyState, AsyncIconButton } from '@/components/app-ui'
import { palette as p, displayFont } from '@/constants/design'
export default function MatchesScreen() {
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    try {
      const { data } = await api.get('/chat/matches')
      setMatches(data)
      setError('')
    } catch {
      setError('Could not load conversations. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])
  useFocusEffect(
    useCallback(() => {
      load(true)
      const timer = setInterval(() => load(), 5000)
      return () => clearInterval(timer)
    }, [load]),
  )
  const pin = async (id: string) => {
    try {
      await api.put('/chat/pin/' + id)
      await load()
    } catch {
      setError('Could not update your pinned conversations.')
    }
  }
  return (
    <View style={s.page}>
      <View style={s.frame}>
        <Text style={s.eyebrow}>MAKE A CONNECTION</Text>
        <Text style={s.title}>A hello goes a long way.</Text>
        <Text style={s.subtitle}>Your conversations, all in one place.</Text>
        {!!error && <Text style={s.error}>{error}</Text>}
        {loading ? (
          <ActivityIndicator color={p.primary} style={{ margin: 40 }} />
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(m) => m._id}
            onRefresh={() => load(true)}
            refreshing={loading}
            contentContainerStyle={{ paddingBottom: 30, gap: 12 }}
            ListEmptyComponent={
              <EmptyState
                title="Your next hello awaits"
                description="Find someone in Explore and start a conversation."
                action="Explore profiles"
                onAction={() => router.push('/(protected)/(tabs)/explore')}
              />
            }
            renderItem={({ item: m }) => (
              <View style={s.card}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={'Chat with ' + m.otherUser.name}
                  onPress={() =>
                    router.push({ pathname: '/(protected)/chat', params: { matchId: m._id } })
                  }
                  style={s.person}
                >
                  <Image source={{ uri: m.otherUser.photo }} style={s.avatar} />
                  <View style={{ flex: 1 }}>
                    <View style={s.row}>
                      <Text style={s.name}>{m.otherUser.name}</Text>
                      <Text style={s.time}>
                        {new Date(m.lastMessageTime).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <Text style={s.preview} numberOfLines={1}>
                      {m.lastMessage}
                    </Text>
                  </View>
                </Pressable>
                <AsyncIconButton title={m.isPinned ? 'Unpin chat' : 'Pin chat'} onPress={() => pin(m._id)} icon={m.isPinned ? 'bookmark' : 'bookmark-outline'} color={m.isPinned ? p.accent : p.muted} />
              </View>
            )}
          />
        )}
      </View>
    </View>
  )
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: p.canvas },
  frame: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 24, flex: 1 },
  eyebrow: {
    color: p.accent,
    letterSpacing: 2,
    fontWeight: '700',
    fontFamily: displayFont, fontSize: 11,
    marginBottom: 12,
  },
  title: { fontFamily: displayFont, fontWeight: '700', color: p.ink,  fontSize: 36 },
  subtitle: { color: p.muted, fontFamily: displayFont, fontSize: 15, marginVertical: 18 },
  error: { color: p.error, padding: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 20,
    padding: 12,
  },
  person: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 6 },
  avatar: { width: 60, height: 60, borderRadius: 20, backgroundColor: p.sage },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'space-between' },
  name: { flex: 1, fontFamily: displayFont, fontSize: 16, fontWeight: '700', color: p.ink },
  time: { color: p.muted, fontFamily: displayFont, fontSize: 10 },
  preview: { color: p.muted, fontFamily: displayFont, fontSize: 14, marginTop: 8 },
})
