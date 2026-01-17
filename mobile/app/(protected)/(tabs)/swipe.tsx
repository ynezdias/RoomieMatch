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
import { connectSocket } from '@/src/sockets'
import { useAuth } from '@/src/context/AuthContext'

const SCREEN_WIDTH = Dimensions.get('window').width

export default function SwipeScreen() {
  const router = useRouter()
  const { user } = useAuth()

  const [profiles, setProfiles] = useState<any[]>([])
  const [matchVisible, setMatchVisible] = useState(false)

  const translateX = useSharedValue(0)
  const matchScale = useSharedValue(0.5)
  const matchOpacity = useSharedValue(0)

  /* ===================== GUARD ===================== */

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    )
  }

  /* ===================== FETCH ===================== */

  const fetchProfiles = async () => {
    try {
      const res = await api.get('/api/swipe/suggestions')
      setProfiles(res.data || [])
    } catch (err: any) {
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
    connectSocket(user._id).then((sock) => {
      if (!sock) return
      sock.on('newMatch', triggerMatch)
    })
  }, [user._id])

  /* ===================== MATCH ===================== */

  const triggerMatch = () => {
    setMatchVisible(true)
    matchScale.value = withSpring(1)
    matchOpacity.value = withSpring(1)
  }

  /* ===================== SWIPE ===================== */

  const handleSwipe = async (
    direction: 'left' | 'right',
    targetId: string
  ) => {
    try {
      const res = await api.post('/api/swipe', {
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

  if (!profiles.length) {
    return (
      <View style={styles.center}>
        <Text>No more profiles</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {profiles.slice(0, 2).reverse().map((p, i) => (
        <GestureDetector
          key={p._id}
          gesture={i === 1 ? panGesture : Gesture.Tap()}
        >
          <Animated.View
            style={[
              styles.card,
              i === 1 && animatedStyle,
              { top: i * 12 },
            ]}
          >
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.sub}>{p.university}</Text>
            <Text style={styles.sub}>{p.city}</Text>
          </Animated.View>
        </GestureDetector>
      ))}

      <Modal visible={matchVisible} transparent>
        <View style={styles.modal}>
          <Animated.View style={matchStyle}>
            <Text style={styles.heart}>❤️</Text>
            <Text style={styles.match}>IT’S A MATCH!</Text>
            <Pressable onPress={() => setMatchVisible(false)}>
              <Text style={styles.continue}>Continue</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute',
    width: '90%',
    height: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  name: { fontSize: 26, fontWeight: 'bold' },
  sub: { color: '#666', marginTop: 4 },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: { fontSize: 100 },
  match: { fontSize: 30, color: '#fff', marginBottom: 20 },
  continue: { color: '#fff', fontSize: 18 },
})
