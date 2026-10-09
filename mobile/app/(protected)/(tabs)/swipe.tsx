import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import api from '@/services/api'
import { Button, EmptyState } from '@/components/app-ui'
import { palette as p, displayFont } from '@/constants/design'
export default function SwipeScreen() {
  const { width, height } = useWindowDimensions()
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [matchId, setMatchId] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const x = useSharedValue(0)
  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/swipe/suggestions')
      setProfiles(data || [])
    } catch {
      setError('Could not load profiles. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])
  const swipe = async (direction: 'left' | 'right') => {
    if (pending.current || !profiles.length) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post('/swipe', { direction, targetUserId: profiles[0].userId._id })
      if (data.match) setMatchId(data.matchId)
      setProfiles((old) => old.slice(1))
    } catch {
      setError('Your choice was not saved. Please try again.')
    } finally {
      pending.current = false
      setBusy(false)
      x.value = withSpring(0)
    }
  }
  const gesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      x.value = e.translationX
    })
    .onEnd(() => {
      if (x.value > 120) runOnJS(swipe)('right')
      else if (x.value < -120) runOnJS(swipe)('left')
      else x.value = withSpring(0)
    })
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: x.value / 30 + 'deg' }],
  }))
  const profile = profiles[0]
  const desktop = width >= 900
  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={[s.content, { flexDirection: desktop ? 'row' : 'column' }]}
    >
      <View
        style={[
          s.intro,
          desktop ? { width: 410, paddingRight: 30 } : { width: '100%', marginBottom: 18 },
        ]}
      >
        <Text style={s.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</Text>
        <Text style={[s.title, { fontSize: desktop ? 48 : 30 }]}>
          Good company.{'\n'}A better home.
        </Text>
        <Text style={s.subtitle}>
          Find someone who fits your rhythm. Get to know them, say hello and see where it goes.
        </Text>
        {desktop && (
          <View style={s.note}>
            <Ionicons name="sparkles-outline" size={22} color={p.ink} />
            <Text style={s.noteText}>Shared routines make all the difference.</Text>
          </View>
        )}
      </View>
      <View style={{ width: Math.min(width - 48, 430), alignSelf: 'center' }}>
        {loading ? (
          <ActivityIndicator color={p.primary} style={{ padding: 50 }} />
        ) : profile ? (
          <>
            <GestureDetector gesture={gesture}>
              <Animated.View style={[s.card, animated]}>
                <Image
                  source={{ uri: profile.photo }}
                  contentFit="contain"
                  style={{
                    width: '100%',
                    height: Math.max(160, Math.min(desktop ? height - 465 : height * 0.34, 340)),
                    backgroundColor: p.sage,
                  }}
                />
                <View style={s.details}>
                  <View style={s.row}>
                    <Text style={s.name}>{profile.userId?.name}</Text>
                    <Text style={s.price}>
                      $ {profile.budget?.toLocaleString()}
                      <Text style={s.month}> / mo</Text>
                    </Text>
                  </View>
                  <Text style={s.city}>
                    {profile.city}
                    {profile.state ? ', ' + profile.state : ''}
                  </Text>
                  <Text style={s.university} numberOfLines={1}>
                    {profile.university}
                  </Text>
                  <Text style={s.about} numberOfLines={2}>
                    {profile.aboutMe}
                  </Text>
                  <View style={s.tags}>
                    {profile.pets && <Text style={s.tag}>Pets welcome</Text>}
                    <Text style={s.tag}>{profile.smoking ? 'Smoking friendly' : 'Smoke free'}</Text>
                    {profile.furniture && <Text style={s.tag}>Has furniture</Text>}
                  </View>
                </View>
              </Animated.View>
            </GestureDetector>
            <View style={s.actions}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Pass"
                  secondary
                  icon="close"
                  disabled={busy}
                  onPress={() => swipe('left')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Like"
                  icon="heart-outline"
                  disabled={busy}
                  onPress={() => swipe('right')}
                />
              </View>
            </View>
            <Text style={s.caption}>Swipe or choose below. A mutual like makes a match.</Text>
          </>
        ) : (
          <EmptyState
            title="You’re all caught up"
            description={error || 'Explore more people or check back for new faces.'}
            action={error ? 'Try again' : 'Explore profiles'}
            onAction={error ? load : () => router.push('/(protected)/(tabs)/explore')}
          />
        )}
        {!!error && !!profile && <Text style={s.error}>{error}</Text>}
      </View>
      <Modal
        visible={!!matchId}
        transparent
        animationType="fade"
        onRequestClose={() => setMatchId('')}
      >
        <View style={s.backdrop}>
          <View style={s.match}>
            <Ionicons name="heart" size={54} color={p.primary} />
            <Text style={s.matchTitle}>You found a connection.</Text>
            <Text style={s.subtitle}>
              You both liked each other. A hello is a great place to start.
            </Text>
            <Button
              title="Send a message"
              onPress={() => {
                const id = matchId
                setMatchId('')
                router.push({ pathname: '/(protected)/chat', params: { matchId: id } })
              }}
            />
            <Button title="Keep exploring" secondary onPress={() => setMatchId('')} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: p.canvas },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  intro: {},
  eyebrow: {
    color: p.accent,
    fontFamily: displayFont, fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 14,
  },
  title: { fontFamily: displayFont, fontWeight: '700', color: p.ink, lineHeight: undefined },
  subtitle: { color: p.muted, fontFamily: displayFont, fontSize: 15, lineHeight: 24, marginTop: 16, marginBottom: 10 },
  note: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: p.sage,
    padding: 18,
    borderRadius: 16,
    marginTop: 24,
  },
  noteText: { color: p.ink, flex: 1, fontFamily: displayFont, fontSize: 13, lineHeight: 21 },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
  },
  details: { padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { fontFamily: displayFont, fontWeight: '700', color: p.ink,  fontSize: 26, flex: 1 },
  price: { color: p.ink, fontFamily: displayFont, fontSize: 15, fontWeight: '700' },
  month: { fontFamily: displayFont, fontSize: 10, color: p.muted, fontWeight: '400' },
  city: { color: p.accent, fontFamily: displayFont, fontSize: 13, marginTop: 6 },
  university: { color: p.muted, fontFamily: displayFont, fontSize: 12, marginTop: 5 },
  about: { color: p.muted, fontFamily: displayFont, fontSize: 14, lineHeight: 21, marginTop: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  tag: {
    backgroundColor: p.sage,
    color: p.ink,
    fontFamily: displayFont, fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actions: { flexDirection: 'row', gap: 14, marginTop: 16 },
  caption: { textAlign: 'center', color: p.muted, fontFamily: displayFont, fontSize: 11, marginTop: 12 },
  error: { color: p.error, textAlign: 'center', paddingTop: 14 },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09070BE6',
    padding: 24,
  },
  match: { backgroundColor: p.canvas, maxWidth: 430, padding: 30, borderRadius: 28, gap: 15 },
  matchTitle: { color: p.ink, fontFamily: displayFont, fontWeight: '700',  fontSize: 32 },
})
