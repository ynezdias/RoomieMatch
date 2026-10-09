import {
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { useCallback, useEffect, useState } from 'react'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import Slider from '@react-native-community/slider'
import { useAuth } from '@/src/context/AuthContext'
import api from '@/services/api'
import { uploadAsset } from '@/services/uploads'
import { Button } from '@/components/app-ui'
import { palette as p, displayFont } from '@/constants/design'
export default function ProfileScreen() {
  const { logout, user } = useAuth()
  const { width } = useWindowDimensions()
  const [form, setForm] = useState({
    aboutMe: '',
    city: '',
    university: '',
    photo: '',
    budget: 1000,
    smoking: false,
    pets: false,
    furniture: false,
  })
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [ready, setReady] = useState(false)
  const [uploading, setUploading] = useState(false)
  const loadProfile = useCallback(() => {
    setNotice('')
    return api
      .get('/profile/me')
      .then(({ data }: any) => {
        if (data)
          setForm((old) => ({
            ...old,
            ...Object.fromEntries(
              Object.keys(old).map((key) => [key, data[key] ?? old[key as keyof typeof old]]),
            ),
          }))
        setReady(true)
      })
      .catch(() => setNotice('Could not load your profile. Please try again.'))
  }, [])
  useEffect(() => {
    loadProfile()
  }, [loadProfile])
  const update = (key: keyof typeof form, value: any) =>
    setForm((old) => ({ ...old, [key]: value }))
  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      })
      if (result.canceled) return
      setUploading(true)
      setNotice('')
      update('photo', await uploadAsset(result.assets[0]))
      setNotice('Photo uploaded. Save your profile to keep this change.')
    } catch (error: any) {
      setNotice(error.message || 'Could not upload your photo.')
    } finally {
      setUploading(false)
    }
  }
  const save = async () => {
    if (loading || !ready || uploading) return
    const missing = [!form.city.trim() && 'city', !form.university.trim() && 'university or workplace'].filter(Boolean)
    if (missing.length) { setNotice('Please enter your ' + missing.join(' and ') + '.'); return }
    if (form.aboutMe.trim().length > 1000) { setNotice('About me must be 1,000 characters or fewer.'); return }
    setLoading(true)
    setNotice('')
    try {
      await api.put('/profile', { ...form, city: form.city.trim(), university: form.university.trim(), aboutMe: form.aboutMe.trim() })
      setNotice('Your profile has been saved.')
    } catch (error: any) {
      const data = error.response?.data
      setNotice(error.response?.status === 401
        ? 'Your session has expired. Log out and sign in again, then save your profile.'
        : data?.msg || data?.message || (error.code === 'ECONNABORTED'
          ? 'Saving timed out. Please try again; your edits are still here.'
          : !error.response ? 'Could not reach the server. Check your connection and try again; your edits are still here.'
          : 'Could not save your profile. Please try again.'))
    } finally {
      setLoading(false)
    }
  }
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>MAKE YOURSELF AT HOME</Text>
      <Text style={s.title}>A little more you.</Text>
      <Text style={s.subtitle}>
        Help your future roommate get to know the person behind the profile.
      </Text>
      <View style={[s.columns, { flexDirection: width >= 850 ? 'row' : 'column' }]}>
        <View style={[s.identity, width >= 850 && { width: 270 }]}>
          {form.photo ? (
            <Image source={{ uri: form.photo }} style={s.avatar} contentFit="cover" />
          ) : (
            <View style={s.avatar}>
              <Text style={s.initial}>{user?.email?.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
          <Text style={s.identityTitle}>Your profile photo</Text>
          <Text style={s.hint}>A friendly face makes a great first impression.</Text>
          <Button title="Change photo" secondary onPress={pickPhoto} loading={uploading} loadingLabel="Updating photo…" />
          <View style={s.tip}>
            <Text style={s.tipTitle}>Find your kind of home.</Text>
            <Text style={s.hint}>
              Share your routines, hobbies and what matters to you in a roommate.
            </Text>
          </View>
        </View>
        <View style={s.form}>
          <Text style={s.section}>The essentials</Text>
          <Text style={s.label}>About me</Text>
          <TextInput
            accessibilityLabel="About me"
            placeholder="Early riser? Weekend cook? Tell your story…"
            placeholderTextColor={p.muted}
            value={form.aboutMe}
            onChangeText={(v) => update('aboutMe', v)}
            multiline
            maxLength={1000}
            style={[s.input, { minHeight: 120, textAlignVertical: 'top' }]}
          />
          <Text style={s.label}>City *</Text>
          <TextInput
            accessibilityLabel="City"
            placeholder="City, State"
            placeholderTextColor={p.muted}
            value={form.city}
            onChangeText={(v) => update('city', v)}
            style={s.input}
          />
          <Text style={s.label}>University or workplace *</Text>
          <TextInput
            accessibilityLabel="University or workplace"
            placeholder="Where you study or work"
            placeholderTextColor={p.muted}
            value={form.university}
            onChangeText={(v) => update('university', v)}
            style={s.input}
          />
          <Text style={s.hint}>* Required to help roommates find you.</Text>
          <View style={s.divider} />
          <Text style={s.section}>Your everyday preferences</Text>
          <View style={s.row}>
            <Text style={s.label}>Monthly budget</Text>
            <Text style={s.price}>$ {Math.round(form.budget).toLocaleString()}</Text>
          </View>
          <Slider
            accessibilityLabel="Monthly budget"
            minimumValue={0}
            maximumValue={5000}
            step={50}
            value={form.budget}
            onValueChange={(v) => update('budget', v)}
            minimumTrackTintColor={p.primary}
            maximumTrackTintColor={p.line}
            thumbTintColor={p.primary}
            style={{ height: 40 }}
          />
          {(['smoking', 'pets', 'furniture'] as const).map((key) => (
            <View style={s.preference} key={key}>
              <Text style={s.preferenceLabel}>
                {key === 'smoking'
                  ? 'Smoking friendly'
                  : key === 'pets'
                    ? 'Pets welcome'
                    : 'Bringing furniture'}
              </Text>
              <Switch
                accessibilityLabel={key}
                value={form[key]}
                onValueChange={(v) => update(key, v)}
                trackColor={{ false: p.line, true: p.primary }}
                thumbColor={form[key] ? p.ink : '#fff'}
              />
            </View>
          ))}
          {!!notice && (
            <Text accessibilityLiveRegion="polite" style={s.notice}>
              {notice}
            </Text>
          )}
          <View style={{ height: 20 }} />
          {!ready && !!notice && <Button title="Try again" secondary onPress={loadProfile} />}
          <Button
            title="Save Profile"
            onPress={save}
            loadingLabel="Saving profile…"
            loading={loading}
            disabled={!ready || uploading}
            icon="checkmark-outline"
          />
          <View style={{ height: 12 }} />
          <Button title="Log out" secondary onPress={logout} loadingLabel="Signing out…" icon="log-out-outline" />
        </View>
      </View>
    </ScrollView>
  )
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: p.canvas },
  content: { width: '100%', maxWidth: 1080, alignSelf: 'center', padding: 24, paddingBottom: 40 },
  eyebrow: {
    fontFamily: displayFont, fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: p.accent,
    marginBottom: 10,
  },
  title: { fontFamily: displayFont, fontWeight: '700', color: p.ink,  fontSize: 40 },
  subtitle: { color: p.muted, fontFamily: displayFont, fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 28 },
  columns: { gap: 24 },
  identity: { padding: 24, backgroundColor: p.sage, borderRadius: 24, alignItems: 'center' },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: p.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  initial: { fontFamily: displayFont, fontWeight: '700',  fontSize: 64, color: p.ink },
  identityTitle: { fontFamily: displayFont, fontSize: 18, fontWeight: '700', color: p.ink },
  hint: { fontFamily: displayFont, fontSize: 14, color: p.muted, lineHeight: 22, textAlign: 'center', marginVertical: 12 },
  tip: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderColor: p.line },
  tipTitle: { fontFamily: displayFont, fontWeight: '700', color: p.ink,  fontSize: 24, textAlign: 'center' },
  form: {
    flex: 1,
    backgroundColor: p.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: p.line,
  },
  section: { fontFamily: displayFont, fontSize: 20, fontWeight: '600', color: p.ink, marginBottom: 8 },
  label: { color: p.ink, fontFamily: displayFont, fontSize: 13, fontWeight: '600', marginVertical: 12 },
  input: {
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 12,
    backgroundColor: p.canvas,
    padding: 14,
    fontFamily: displayFont, fontSize: 15,
    color: p.ink,
  },
  divider: { height: 1, backgroundColor: p.line, marginVertical: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: p.accent, fontWeight: '700', fontFamily: displayFont, fontSize: 20 },
  preference: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: p.line,
  },
  preferenceLabel: { fontFamily: displayFont, fontSize: 15, color: p.ink },
  notice: {
    color: p.ink,
    backgroundColor: p.sage,
    padding: 14,
    borderRadius: 12,
    marginVertical: 18,
    lineHeight: 21,
  },
})
