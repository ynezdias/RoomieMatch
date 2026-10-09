import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Brand, Button } from '@/components/app-ui'
import { palette as p, displayFont } from '@/constants/design'
export default function LandingPage() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const wide = width >= 900
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Brand />
        <Button title="Log in" secondary onPress={() => router.push('/login')} />
      </View>
      <View style={[s.hero, { flexDirection: wide ? 'row' : 'column' }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>A PLACE TO BELONG</Text>
          <Text style={[s.title, { fontSize: wide ? 72 : 48 }]}>
            Find your people.{'\n'}Feel <Text style={{ color: p.accent }}>at home.</Text>
          </Text>
          <Text style={s.body}>
            More than a shared address. Meet roommates who share your lifestyle, your budget and
            your idea of a great home.
          </Text>
          <View style={s.actions}>
            <Button
              title="Get Started"
              icon="arrow-forward"
              onPress={() => router.push('/onboarding')}
            />
            <Text style={s.small}>Your next chapter starts with a hello.</Text>
          </View>
        </View>
        <View style={[s.visual, { width: wide ? 450 : '100%', marginTop: wide ? 0 : 30 }]}>
          <View style={s.visualHeader}>
            <Text style={s.visualLabel}>YOUR KIND OF COMPANY</Text>
            <Ionicons name="sparkles-outline" size={22} color={p.ink} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Image
              source={require('../Profiles/cld-sample.jpg')}
              style={[s.room, { flex: 1, width: undefined, height: 300 }]}
              contentFit="cover"
              contentPosition="top"
            />
            <Image
              source={require('../Profiles/man-portrait.jpg')}
              style={[s.room, { flex: 1, width: undefined, height: 270, marginTop: 30 }]}
              contentFit="cover"
              contentPosition="top"
            />
          </View>
          <View style={s.visualFooter}>
            <View style={s.homeIcon}>
              <Ionicons name="home-outline" color={p.ink} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.visualTitle}>A home that feels like you.</Text>
              <Text style={s.small}>New city. New friends. New possibilities.</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={[s.features, { flexDirection: wide ? 'row' : 'column' }]}>
        {[
          {
            icon: 'compass-outline',
            title: 'Find your fit',
            text: 'Explore people by city, budget and the things you have in common.',
          },
          {
            icon: 'chatbubbles-outline',
            title: 'Make a connection',
            text: 'Skip the guesswork. Start a conversation before sharing a home.',
          },
          {
            icon: 'heart-outline',
            title: 'Share your everyday',
            text: 'From quiet mornings to weekend plans, find a rhythm that works.',
          },
        ].map((item) => (
          <View key={item.title} style={s.feature}>
            <Ionicons name={item.icon as any} size={27} color={p.primary} />
            <Text style={s.featureTitle}>{item.title}</Text>
            <Text style={s.featureText}>{item.text}</Text>
          </View>
        ))}
      </View>
      <Text style={s.footer}>roomiematch. · Good company makes a place feel like home.</Text>
    </ScrollView>
  )
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: p.canvas },
  content: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  hero: { alignItems: 'center', gap: 42, paddingVertical: 35 },
  eyebrow: {
    color: p.accent,
    fontFamily: displayFont, fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 22,
  },
  title: { fontFamily: displayFont, fontWeight: '700', color: p.ink, letterSpacing: -2 },
  body: { fontFamily: displayFont, fontSize: 17, lineHeight: 29, color: p.muted, maxWidth: 460, marginTop: 24 },
  actions: { alignItems: 'flex-start', gap: 15, marginTop: 28 },
  small: { color: p.muted, fontFamily: displayFont, fontSize: 12, lineHeight: 19 },
  visual: {
    backgroundColor: p.sage,
    padding: 18,
    borderRadius: 32,
    transform: [{ rotate: '1deg' }],
  },
  visualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  visualLabel: { color: p.ink, letterSpacing: 2, fontFamily: displayFont, fontSize: 10, fontWeight: '700' },
  room: { width: '100%', height: 310, borderRadius: 20 },
  visualFooter: {
    backgroundColor: p.surface,
    padding: 17,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  homeIcon: { backgroundColor: p.sage, borderRadius: 14, padding: 13 },
  visualTitle: { fontFamily: displayFont, fontWeight: '700',  fontSize: 19, color: p.ink, marginBottom: 4 },
  features: { gap: 24, paddingVertical: 35, borderTopWidth: 1, borderColor: p.line, marginTop: 30 },
  feature: { flex: 1, gap: 12 },
  featureTitle: { color: p.ink, fontFamily: displayFont, fontWeight: '700',  fontSize: 24 },
  featureText: { fontFamily: displayFont, fontSize: 14, lineHeight: 23, color: p.muted },
  footer: { color: p.muted, fontFamily: displayFont, fontSize: 11, paddingTop: 15, borderTopWidth: 1, borderColor: p.line },
})
