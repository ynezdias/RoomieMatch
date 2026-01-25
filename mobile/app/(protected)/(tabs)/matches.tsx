import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import api from '@/services/api'
import { Ionicons } from '@expo/vector-icons'

export default function MatchesScreen() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  useFocusEffect(
    useCallback(() => {
      fetchMatches()
    }, [])
  )

  if (loading && !matches.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matches</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matches yet.</Text>
            <Text style={styles.emptySub}>Start swiping to find roommates!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
              pathname: '/(protected)/chat',
              params: { matchId: item._id }
            })}
          >
            <Image
              source={{ uri: item.otherUser?.photo }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.otherUser?.name}</Text>
              <Text style={styles.lastMsg}>{item.lastMessage}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4b5563" />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // consistent dark theme
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  center: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#f8fafc',
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
    color: '#cbd5e1',
  },
  emptySub: {
    marginTop: 8,
    fontSize: 15,
    color: '#64748b',
  },
})
