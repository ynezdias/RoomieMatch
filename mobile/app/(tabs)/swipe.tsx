import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import api from '@/services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SwipeScreen() {
  const translateX = useSharedValue(0);

  const sendSwipe = async (action: 'like' | 'dislike') => {
    try {
      await api.post('/swipe', {
        targetUserId: 'DUMMY_USER_ID',
        action,
      });
    } catch (err) {
      console.log('Swipe error', err);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value > 120) {
        runOnJS(sendSwipe)('like');
        translateX.value = withSpring(SCREEN_WIDTH);
      } else if (translateX.value < -120) {
        runOnJS(sendSwipe)('dislike');
        translateX.value = withSpring(-SCREEN_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Text style={styles.name}>Alex</Text>
          <Text>NYU · Budget $900–1200</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    height: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});