import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import api from '@/services/api'
import { connectSocket } from '@/src/sockets'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

export default function SwipeScreen() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [matchVisible, setMatchVisible] = useState(false)
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null)

  const translateX = useSharedValue(0)
  const matchScale = useSharedValue(0.5)
  const matchOpacity = useSharedValue(0)

  /* ===================== FETCH PROFILES ===================== */

  const fetchProfiles = async () => {
    try {
      const res = await api.get('/swipe/suggestions')
      setProfiles(res.data || [])
    } catch (err) {
      console.log('❌ FETCH PROFILES ERROR', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  /* ===================== MATCH ANIMATION ===================== */

  const triggerMatch = (matchId: string) => {
    setActiveMatchId(matchId)
    setMatchVisible(true)
    matchScale.value = withSpring(1)
    matchOpacity.value = withSpring(1)
  }

  /* ===================== SWIPE HANDLER ===================== */

  const handleSwipe = async (
    direction: 'left' | 'right',
    targetId: string
  ) => {
    try {
      const res = await api.post('/swipe', {
        targetUserId: targetId,
        direction,
      })

      if (res.data?.match) {
        triggerMatch(res.data.matchId)
      }
    } catch (err) {
      console.log('❌ SWIPE ERROR', err)
    }

    setProfiles((prev) => prev.slice(1))
    translateX.value = 0
  }

  /* ===================== GESTURE ===================== */

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX
    })
    .onEnd(() => {
      if (!profiles.length) return

      if (translateX.value > 120) {
        runOnJS(handleSwipe)('right', profiles[0]._id)
      } else if (translateX.value < -120) {
        runOnJS(handleSwipe)('left', profiles[0]._id)
      } else {
        translateX.value = withSpring(0)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${translateX.value / 20}deg` }
    ],
  }))

  const matchStyle = useAnimatedStyle(() => ({
    opacity: matchOpacity.value,
    transform: [{ scale: matchScale.value }],
  }))

  /* ===================== STATES ===================== */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ce0000" />
        <Text style={styles.loadingText}>Finding matches...</Text>
      </View>
    )
  }

  if (!profiles.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No more profiles</Text>
      </View>
    )
  }

  /* ===================== UI ===================== */

  return (
    <View style={styles.container}>
      {profiles
        .slice(0, 2)
        .reverse()
        .map((p, i) => (
          <GestureDetector
            key={p._id}
            gesture={i === 1 ? panGesture : Gesture.Tap()}
          >
            <Animated.View
              style={[
                styles.card,
                i === 1 && animatedStyle,
                { zIndex: i === 1 ? 10 : 1, transform: i === 0 ? [{ scale: 0.95 }] : [] },
              ]}
            >
              <LinearGradient
                colors={['#1e293b', '#0f172a']}
                style={styles.cardGradient}
              >
                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{p.userId?.name}</Text>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="school-outline" size={16} color="#9ca3af" />
                    <Text style={styles.sub}>{p.university}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#9ca3af" />
                    <Text style={styles.sub}>{p.city}</Text>
                  </View>

                  <View style={styles.budgetBadge}>
                    <Text style={styles.budgetText}>Budget: ${p.budget}/mo</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        ))}

      {/* MATCH MODAL */}
      <Modal visible={matchVisible} transparent animationType="fade">
        <View style={styles.modal}>
          <Animated.View style={[styles.matchBox, matchStyle]}>
            <Text style={styles.heart}>❤️</Text>
            <Text style={styles.match}>IT’S A MATCH!</Text>
            
            <Pressable 
              style={styles.messageBtn} 
              onPress={() => {
                setMatchVisible(false)
                if (activeMatchId) {
                  router.push({
                    pathname: '/(protected)/chat',
                    params: { matchId: activeMatchId }
                  } as any)
                } else {
                  router.push('/(protected)/(tabs)/matches' as any) 
                }
              }}
            >
              <Text style={styles.messageText}>Send a Message</Text>
            </Pressable>

            <Pressable onPress={() => setMatchVisible(false)}>
              <Text style={styles.continue}>Keep Swiping</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#9ca3af',
  },
  empty: {
    color: '#9ca3af',
    fontSize: 16,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.88,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: '#020617',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 32,
    fontWeight: '900',
    color: '#f8fafc',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '500',
  },
  budgetBadge: {
    marginTop: 20,
    backgroundColor: 'rgba(206, 0, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(206, 0, 0, 0.3)',
  },
  budgetText: {
    color: '#ce0000',
    fontSize: 16,
    fontWeight: '700',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBox: {
    alignItems: 'center',
  },
  heart: {
    fontSize: 100,
  },
  match: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 30,
    letterSpacing: 1.5,
  },
  continue: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
  },
  messageBtn: {
    backgroundColor: '#ce0000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
    elevation: 4,
    shadowColor: '#ce0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  messageText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
})

