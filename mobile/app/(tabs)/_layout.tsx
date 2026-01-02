import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import api from '@/services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SwipeScreen() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const translateX = useSharedValue(0);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const res = await api.get('/users/suggestions');
    setProfiles(res.data);
  };

  const handleSwipe = async (action: 'like' | 'dislike', targetId: string) => {
    const res = await api.post('/swipe', {
      targetUserId: targetId,
      action,
    });

    if (res.data.match) {
      alert('🎉 It’s a Match!');
    }

    setProfiles((prev) => prev.slice(1)); // 🔥 remove card
    translateX.value = 0;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      if (translateX.value > 120) {
        runOnJS(handleSwipe)('like', profiles[0]._id);
        translateX.value = withSpring(SCREEN_WIDTH);
      } else if (translateX.value < -120) {
        runOnJS(handleSwipe)('dislike', profiles[0]._id);
        translateX.value = withSpring(-SCREEN_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (profiles.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No more profiles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profiles
        .slice(0, 2)
        .reverse()
        .map((user, index) => {
          const isTop = index === 1;

          return (
            <GestureDetector key={user._id} gesture={isTop ? panGesture : Gesture.Tap()}>
              <Animated.View
                style={[
                  styles.card,
                  isTop && animatedStyle,
                  { top: index * 8 },
                ]}
              >
                <Text style={styles.name}>{user.name}</Text>
                <Text>{user.university}</Text>
                <Text>${user.budget.min} – ${user.budget.max}</Text>
              </Animated.View>
            </GestureDetector>
          );
        })}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '90%',
    height: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
