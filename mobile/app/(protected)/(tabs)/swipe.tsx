import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
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
import { connectSocket } from '../../../src/sockets'

const SCREEN_WIDTH = Dimensions.get('window').width

export default function SwipeScreen() {
  const router = useRouter()

  const [profiles, setProfiles] = useState<any[]>([])
  const [matchVisible, setMatchVisible] = useState(false)

  const translateX = useSharedValue(0)

  // 🔥 MATCH ANIMATION VALUES
  const matchScale = useSharedValue(0.5)
  const matchOpacity = useSharedValue(0)

  /* ===================== FETCH PROFILES ===================== */

  const fetchProfiles = async () => {
    try {
      const res = await api.get('/users/suggestions')
      setProfiles(res.data || [])
    } catch (err: any) {
      // 🔒 Force profile completion
      if (err.response?.status === 403) {
        router.replace('/(protected)/(tabs)/profile')
      } else {
        console.log('❌ FETCH ERROR', err)
      }
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  /* ===================== SOCKET ===================== */

  useEffect(() => {
    let mounted = true

    connectSocket().then((sock) => {
      if (!sock || !mounted) return

      sock.on('newMatch', () => {
        triggerMatch()
      })
    })

    return () => {
      mounted = false
    }
  }, [])

  /* ===================== MATCH TRIGGER ===================== */

  const triggerMatch = () => {
    setMatchVisible(true)

    matchScale.value = 0.5
    matchOpacity.value = 0

    matchScale.value = withSpring(1.2)
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
        translateX.value = withSpring(SCREEN_WIDTH)
        runOnJS(handleSwipe)('right', profiles[0]._id)
      } else if (translateX.value < -120) {
        translateX.value = withSpring(-SCREEN_WIDTH)
        runOnJS(handleSwipe)('left', profiles[0]._id)
      } else {
        translateX.value = withSpring(0)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const matchAnimatedStyle = useAnimatedStyle(() => ({
    opacity: matchOpacity.value,
    transform: [{ scale: matchScale.value }],
  }))

  /* ===================== EMPTY STATE ===================== */

  if (!profiles.length) {
    return (
      <View style={styles.center}>
        <Text>No more profiles</Text>
      </View>
    )
  }

  /* ===================== UI ===================== */

  return (
    <View style={styles.container}>
      {profiles
        .slice(0, 2)
        .reverse()
        .map((user, index) => {
          const isTop = index === 1

          return (
            <GestureDetector
              key={user._id}
              gesture={isTop ? panGesture : Gesture.Tap()}
            >
              <Animated.View
                style={[
                  styles.card,
                  isTop && animatedStyle,
                  { top: index * 12 },
                ]}
              >
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.sub}>{user.university}</Text>

                {user.budget?.min != null &&
                  user.budget?.max != null && (
                    <Text style={styles.sub}>
                      ${user.budget.min} – ${user.budget.max}
                    </Text>
                  )}
              </Animated.View>
            </GestureDetector>
          )
        })}

      {/* ===================== TINDER MATCH MODAL ===================== */}

      <Modal visible={matchVisible} transparent animationType="none">
        <View style={styles.modal}>
          <Animated.View style={matchAnimatedStyle}>
            <Text style={styles.heart}>❤️</Text>
            <Text style={styles.matchText}>IT’S A MATCH!</Text>

            <Pressable
              onPress={() => {
                matchOpacity.value = withSpring(0)
                matchScale.value = withSpring(0.5)
                setTimeout(() => setMatchVisible(false), 250)
              }}
            >
              <Text style={styles.close}>Continue Swiping</Text>
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: '90%',
    height: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sub: {
    fontSize: 16,
    color: '#555',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: {
    fontSize: 100,
    textAlign: 'center',
    marginBottom: 20,
  },
  matchText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  close: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
})
