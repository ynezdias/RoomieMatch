import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import api from '@/services/api'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/src/context/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'

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

  const togglePin = async (matchId: string) => {
      try {
          await api.put(`/chat/pin/${matchId}`)
          fetchMatches()
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
      <View style={styles.center}>
        <LinearGradient
          colors={['#020617', '#0f172a']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={colors.primary} />
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
          <Text style={[styles.title, { color: colors.text }]}>Messages</Text>

          <FlatList
            data={matches}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={loading}
            onRefresh={fetchMatches}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={64} color="#334155" />
                <Text style={[styles.emptyText, { color: colors.text }]}>No messages yet</Text>
                <Text style={styles.emptySub}>Connect with people to start chatting!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                    styles.card, 
                    { backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: '#334155' },
                    item.isPinned && { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: 'rgba(206, 0, 0, 0.05)' }
                ]}
                onPress={() => router.push({
                  pathname: '/chat',
                  params: { matchId: item._id }
                })}
                onLongPress={() => togglePin(item._id)}
              >
                <View style={styles.avatarWrapper}>
                    <Image
                    source={{ uri: item.otherUser?.photo || `https://ui-avatars.com/api/?name=${item.otherUser?.name}` }}
                    style={styles.avatar}
                    />
                    {item.otherUser?.isOnline && <View style={styles.onlineStatus} />}
                </View>

                <View style={styles.info}>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                      <Text style={[styles.name, { color: colors.text }]}>{item.otherUser?.name}</Text>
                      {item.isPinned && <Ionicons name="pin" size={14} color={colors.primary} />}
                  </View>
                  <Text style={styles.lastMsg} numberOfLines={1}>
                    {item.lastMessage || 'Send a message...'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#475569" />
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#1e293b',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#0f172a',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  lastMsg: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: 120,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
  },
  emptySub: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
})
