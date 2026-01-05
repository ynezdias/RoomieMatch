import { View, Text, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { connectSocket } from '../../../src/socket'


const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SwipeScreen() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [matchVisible, setMatchVisible] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  const translateX = useSharedValue(0);

  /* ===================== FETCH USERS ===================== */

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await api.get('/users/suggestions');
      setProfiles(res.data || []);
    } catch (err) {
      console.log('FETCH ERROR', err);
    }
  };

  /* ===================== SOCKET ===================== */

  useEffect(() => {
    let s: any;

    connectSocket().then((sock) => {
      s = sock;
      setSocket(sock);

      sock.on('match', () => {
        setMatchVisible(true);
      });
    });

    return () => {
      s?.disconnect();
    };
  }, []);

  /* ===================== SWIPE HANDLER ===================== */

  const handleSwipe = async (action: 'like' | 'dislike', targetId: string) => {
    try {
      const res = await api.post('/swipe', {
        targetUserId: targetId,
        action,
      });

      if (res.data?.match) {
        setMatchVisible(true);
      }
    } catch (err) {
      console.log('SWIPE ERROR', err);
    }

    setProfiles((prev) => prev.slice(1));
    translateX.value = 0;
  };

  /* ===================== GESTURE ===================== */

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      if (!profiles.length) return;

      if (translateX.value > 120) {
        translateX.value = withSpring(SCREEN_WIDTH);
        runOnJS(handleSwipe)('like', profiles[0]._id);
      } else if (translateX.value < -120) {
        translateX.value = withSpring(-SCREEN_WIDTH);
        runOnJS(handleSwipe)('dislike', profiles[0]._id);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  /* ===================== EMPTY STATE ===================== */

  if (!profiles.length) {
    return (
      <View style={styles.center}>
        <Text>No more profiles</Text>
      </View>
    );
  }

  /* ===================== UI ===================== */

  return (
    <View style={styles.container}>
      {profiles
        .slice(0, 2)
        .reverse()
        .map((user, index) => {
          const isTop = index === 1;

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
                <Text style={styles.sub}>
                  ${user.budget.min} – ${user.budget.max}
                </Text>
              </Animated.View>
            </GestureDetector>
          );
        })}

      {/* ===================== MATCH MODAL ===================== */}

      <Modal visible={matchVisible} transparent animationType="fade">
        <View style={styles.modal}>
          <Text style={styles.matchText}>🎉 IT’S A MATCH!</Text>
          <Pressable onPress={() => setMatchVisible(false)}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
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
  matchText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  close: {
    fontSize: 18,
    color: '#fff',
  },
});
