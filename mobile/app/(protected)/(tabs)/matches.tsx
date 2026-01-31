import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import api from '@/services/api'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/src/context/ThemeContext'

export default function MatchesScreen() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { colors } = useTheme()

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const res = await api.get('/chat/matches')
      setMatches(res.data)
    } catch (err) {
      console.log('❌ FETCH MATCHES ERROR', err)
    } finally {
      setLoading(false)
    }
  }

  const togglePin = async (matchId) => {
      try {
          await api.put(`/chat/pin/${matchId}`)
          fetchMatches() // Refresh logic could be optimistic for better UX
      } catch (e) {
          console.log(e)
      }
  }

  useFocusEffect(
    useCallback(() => {
      fetchMatches()
    }, [])
  )

  if (loading && !matches.length) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Matches</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={fetchMatches}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>No matches yet.</Text>
            <Text style={styles.emptySub}>Start swiping to find roommates!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
                styles.card, 
                { backgroundColor: colors.secondary, borderColor: colors.border },
                item.isPinned && { borderColor: colors.primary, borderWidth: 2 }
            ]}
            onPress={() => router.push({
              pathname: '/(protected)/chat',
              params: { matchId: item._id }
            })}
            onLongPress={() => togglePin(item._id)}
          >
            <Image
              source={{ uri: item.otherUser?.photo }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.otherUser?.name}</Text>
                  {item.isPinned && <Ionicons name="pin" size={12} color={colors.primary} style={{marginLeft: 6}} />}
              </View>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#334155',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  lastMsg: {
    fontSize: 14,
    color: '#94a3b8',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySub: {
    marginTop: 8,
    fontSize: 15,
    color: '#64748b',
  },
})
