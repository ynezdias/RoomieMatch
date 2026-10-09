import { useRef, useState } from 'react'
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette as c, displayFont } from '@/constants/design'

export function useAsyncAction(action: () => void | Promise<unknown>) {
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const run = () => {
    if (pending.current) return
    pending.current = true
    try {
      const result = action()
      if (result && typeof result.then === 'function') {
        setBusy(true)
        return Promise.resolve(result).finally(() => { pending.current = false; setBusy(false) })
      }
      pending.current = false
    } catch (error) { pending.current = false; throw error }
  }
  return { busy, run }
}
export function AsyncIconButton({ title, onPress, icon, color = c.muted, size = 20 }: {
  title: string; onPress: () => void | Promise<unknown>;
  icon: React.ComponentProps<typeof Ionicons>['name']; color?: string; size?: number;
}) {
  const { busy, run } = useAsyncAction(onPress)
  return <Pressable accessibilityRole="button" accessibilityLabel={title}
    aria-busy={busy} accessibilityState={{ busy, disabled: busy }} disabled={busy} onPress={run}
    style={{ padding: 12, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
    {busy ? <ActivityIndicator color={color} size="small" /> : <Ionicons name={icon} color={color} size={size} />}
  </Pressable>
}
export function FormNotice({ message }: { message: string }) {
  if (!message) return null
  return <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', gap: 9,
    alignItems: 'center', backgroundColor: c.primarySoft, borderColor: c.line, borderWidth: 1,
    borderRadius: 12, padding: 12, marginTop: 12 }}>
    <Ionicons name="alert-circle-outline" size={18} color={c.error} />
    <Text style={{ color: c.error, fontFamily: displayFont, fontSize: 13, lineHeight: 19, flex: 1 }}>{message}</Text>
  </View>
}
export function Brand() {
  return (
    <View style={s.brand}>
      <View style={s.mark}>
        <Ionicons name="home" size={22} color="white" />
      </View>
      <Text style={s.wordmark}>
        roomie<Text style={{ color: c.accent }}>match</Text>
        <Text style={{ color: c.accent }}>.</Text>
      </Text>
    </View>
  )
}
export function Button({
  title,
  onPress,
  secondary = false,
  loading = false,
  disabled = false,
  icon,
  loadingLabel,
}: {
  title: string
  onPress: () => void | Promise<unknown>
  loadingLabel?: string
  secondary?: boolean
  loading?: boolean
  disabled?: boolean
  icon?: React.ComponentProps<typeof Ionicons>['name']
}) {
  const { busy, run } = useAsyncAction(onPress)
  const pending = busy || loading
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={run}
      disabled={disabled || pending}
      aria-busy={pending}
      accessibilityState={{ disabled: disabled || pending, busy: pending }}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        disabled && !pending && { opacity: 0.55 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {pending ? <ActivityIndicator color={secondary ? c.ink : 'white'} size="small" /> : icon && <Ionicons name={icon} size={19} color={secondary ? c.ink : 'white'} />}
      <Text style={[s.buttonText, secondary && { color: c.ink }]}>{pending ? loadingLabel || 'Please wait…' : title}</Text>
    </Pressable>
  )
}
export function EmptyState({
  title,
  description,
  action,
  onAction,
}: {
  title: string
  description: string
  action?: string
  onAction?: () => void | Promise<unknown>
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Ionicons name="sparkles-outline" size={32} color={c.ink} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptyBody}>{description}</Text>
      {action && onAction && <Button title={action} onPress={onAction} />}
    </View>
  )
}
const s = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: c.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { color: c.ink, fontFamily: displayFont, fontSize: 23, fontWeight: '800', letterSpacing: -1 },
  button: {
    minHeight: 50,
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: c.primary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondary: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line },
  buttonText: { fontFamily: displayFont, fontSize: 15, fontWeight: '700', color: 'white' },
  empty: { alignItems: 'center', padding: 40, gap: 16 },
  emptyIcon: {
    width: 70,
    height: 70,
    backgroundColor: c.sage,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { color: c.ink, fontFamily: displayFont, fontWeight: '700',  fontSize: 28, textAlign: 'center' },
  emptyBody: { color: c.muted, fontFamily: displayFont, fontSize: 15, textAlign: 'center', lineHeight: 24, maxWidth: 380 },
})
