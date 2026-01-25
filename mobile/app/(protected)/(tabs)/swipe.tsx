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
import api from '@/services/api'
import { connectSocket } from '@/src/sockets'

const SCREEN_WIDTH = Dimensions.get('window').width

export default function SwipeScreen() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [matchVisible, setMatchVisible] = useState(false)

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

  const triggerMatch = () => {
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
        triggerMatch()
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
    transform: [{ translateX: translateX.value }],
  }))

  const matchStyle = useAnimatedStyle(() => ({
    opacity: matchOpacity.value,
    transform: [{ scale: matchScale.value }],
  }))

  /* ===================== STATES ===================== */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
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
                { top: i * 10 },
              ]}
            >
              <Text style={styles.name}>{p.userId?.name}</Text>
              <Text style={styles.sub}>{p.university}</Text>
              <Text style={styles.sub}>{p.city}</Text>
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
                // matchId should be stored in state when match happens, but for now we might need to just go to matches list
                // OR we can't easily jump to chat without the ID.
                // The backend returns { match: true, matchId: ... }
                // I need to update handleSwipe to save that ID.
                router.push('/(protected)/(tabs)/matches' as any) 
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
    width: '88%',
    height: 420,
    backgroundColor: '#020617',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
    color: '#9ca3af',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
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
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  continue: {
    color: '#9ca3af', // Change color to be less prominent
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  messageBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 10,
  },
  messageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
})
