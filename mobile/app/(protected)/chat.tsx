import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
  AppState,
} from 'react-native'
import { Image } from 'expo-image'
import { Video, ResizeMode } from 'expo-av'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '@/services/api'
import { useAuth } from '@/src/context/AuthContext'
import MediaPicker from '@/src/components/MediaPicker'
import { uploadAsset } from '@/services/uploads'
import { palette as p, displayFont } from '@/constants/design'

export default function ChatScreen() {
  const { user } = useAuth()
  const { matchId: param } = useLocalSearchParams<{ matchId: string }>()
  const matchId = Array.isArray(param) ? param[0] : param
  const router = useRouter()
  const userId = user?._id || user?.id
  const [messages, setMessages] = useState<any[]>([])
  const [partner, setPartner] = useState<any>(null)
  const [text, setText] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [picker, setPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sendingCount, setSendingCount] = useState(0)
  const [deletingConversation, setDeletingConversation] = useState(false)
  const deletingRoom = useRef(false)
  const deletingMessages = useRef(new Set<string>())
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const list = useRef<FlatList>(null)
  const atBottom = useRef(true)
  const sending = useRef(new Set<string>())
  const alive = useRef(true)
  const currentRoom = useRef(matchId)
  currentRoom.current = matchId
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  const sync = useCallback(async () => {
    const { data } = await api.get('/chat/' + matchId)
    if (!alive.current || currentRoom.current !== matchId) return
    setMessages((previous) => {
      const confirmed = new Set(data.map((m: any) => m.clientId).filter(Boolean))
      const pending = previous.filter((m) => m.pending && !confirmed.has(m.clientId))
      return [...data.reverse(), ...pending].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    })
    setNotice('')
    if (
      data.some(
        (m: any) => String(m.sender?._id || m.sender) !== userId && !m.seenBy?.includes(userId),
      )
    )
      await api.put('/chat/' + matchId + '/read')
  }, [matchId, userId])
  useEffect(() => {
    if (!matchId || !userId) return
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    let busy = false
    const refresh = async () => {
      if (stopped || busy) return
      busy = true
      try {
        if (
          AppState.currentState === 'active' &&
          (Platform.OS !== 'web' || typeof document === 'undefined' || !document.hidden)
        )
          await sync()
      } catch {
        if (!stopped) setNotice('Connection interrupted. Messages will sync when you reconnect.')
      } finally {
        busy = false
        if (!stopped) {
          setLoading(false)
          timer = setTimeout(refresh, 2500)
        }
      }
    }
    api
      .get('/chat/match/' + matchId)
      .then(({ data }: any) => {
        if (!stopped) setPartner(data.partner)
      })
      .catch(() => {
        if (!stopped) setNotice('Could not open this conversation.')
      })
    refresh()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !busy) {
        clearTimeout(timer)
        refresh()
      }
    })
    return () => {
      stopped = true
      clearTimeout(timer)
      subscription.remove()
    }
  }, [matchId, userId, sync])
  const persist = async (message: any) => {
    if (sending.current.has(message.clientId)) return
    sending.current.add(message.clientId)
    setSendingCount(sending.current.size)
    setMessages((old) =>
      old.map((m) => (m.clientId === message.clientId ? { ...m, failed: false } : m)),
    )
    try {
      const { data } = await api.post('/chat/' + matchId + '/messages', {
        clientId: message.clientId,
        text: message.text,
        type: message.type,
        mediaUrl: message.mediaUrl,
      })
      if (alive.current)
        setMessages((old) =>
          [...old.filter((m) => m.clientId !== message.clientId && m._id !== data._id), data].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        )
    } catch {
      if (alive.current)
        setMessages((old) =>
          old.map((m) => (m.clientId === message.clientId ? { ...m, failed: true } : m)),
        )
    } finally {
      sending.current.delete(message.clientId)
      if (alive.current) setSendingCount(sending.current.size)
    }
  }
  const send = (content = text, type = 'text', mediaUrl?: string) => {
    if (type === 'text' && (!content.trim() || sending.current.size > 0)) return
    const clientId = 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2)
    const message = {
      _id: clientId,
      clientId,
      sender: userId,
      text: content.trim(),
      type,
      mediaUrl,
      createdAt: new Date().toISOString(),
      pending: true,
      seenBy: [],
    }
    atBottom.current = true
    setMessages((old) => [...old, message])
    if (type === 'text') setText('')
    return persist(message)
  }
  const remove = async (message: any) => {
    if (deletingMessages.current.has(message._id)) return
    deletingMessages.current.add(message._id)
    setDeletingIds([...deletingMessages.current])
    try {
      if (message.pending) {
        setMessages((old) => old.filter((m) => m._id !== message._id))
        return
      }
      const { data } = await api.delete('/chat/' + matchId + '/messages/' + message._id)
      setMessages((old) => old.map((m) => (m._id === data._id ? data : m)))
    } catch {
      setNotice('Could not delete this message. Please try again.')
    } finally {
      deletingMessages.current.delete(message._id)
      if (alive.current) setDeletingIds([...deletingMessages.current])
    }
  }
  const confirmRemove = (message: any) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this message?')) remove(message)
    } else
      Alert.alert('Delete message?', 'This message will be removed for both people.', [
        { text: 'Cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove(message) },
      ])
  }
  const deleteConversation = () => {
    const erase = async () => {
      if (deletingRoom.current) return
      deletingRoom.current = true
      setDeletingConversation(true)
      try {
        await api.delete('/chat/' + matchId)
        router.replace('/(protected)/(tabs)/matches')
      } catch {
        setNotice('Could not delete this conversation. Please try again.')
      } finally {
        deletingRoom.current = false
        if (alive.current) setDeletingConversation(false)
      }
    }
    const warning = 'Permanently delete this conversation and all messages for both people?'
    if (Platform.OS === 'web') {
      if (window.confirm(warning)) erase()
    } else
      Alert.alert('Delete conversation?', warning, [
        { text: 'Cancel' },
        { text: 'Delete', style: 'destructive', onPress: erase },
      ])
  }
  const attach = async (asset: any, type: string) => {
    setPicker(false)
    setUploading(true)
    setNotice('')
    try {
      const url = await uploadAsset(asset, type)
      if (alive.current) await send(asset.fileName || asset.name || '', type, url)
    } catch (error: any) {
      if (alive.current) setNotice(error.message || 'Could not upload. Please try again.')
    } finally {
      if (alive.current) setUploading(false)
    }
  }
  return (
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.frame}>
        <View style={s.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to chats"
            onPress={() => router.replace('/(protected)/(tabs)/matches')}
            style={s.icon}
          >
            <Ionicons name="arrow-back" size={24} color={p.ink} />
          </Pressable>
          <Image source={{ uri: partner?.photo }} style={s.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{partner?.name || 'Your conversation'}</Text>
            <Text style={s.sub}>Messages sync automatically</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete conversation"
            disabled={deletingConversation}
            aria-busy={deletingConversation} accessibilityState={{ busy: deletingConversation, disabled: deletingConversation }}
            onPress={deleteConversation}
            style={s.icon}
          >
            {deletingConversation ? <ActivityIndicator color={p.accent} /> : <Ionicons name="trash-outline" size={20} color={p.muted} />}
          </Pressable>
        </View>
        {!!notice && (
          <Text accessibilityLiveRegion="polite" style={s.notice}>
            {notice}
          </Text>
        )}
        {loading ? (
          <ActivityIndicator color={p.primary} style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={list}
            data={messages}
            keyExtractor={(m) => m._id}
            contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1 }}
            onScroll={(e) => {
              const n = e.nativeEvent
              atBottom.current =
                n.contentSize.height - n.contentOffset.y - n.layoutMeasurement.height < 100
            }}
            scrollEventThrottle={100}
            onContentSizeChange={() => {
              if (atBottom.current) list.current?.scrollToEnd({ animated: false })
            }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.name}>Start with a hello.</Text>
                <Text style={s.sub}>Ask about their routines, plans or ideal home.</Text>
              </View>
            }
            renderItem={({ item: m }) => {
              if (m.type === 'system') return <Text style={s.system}>{m.text}</Text>
              const mine = String(m.sender?._id || m.sender) === userId
              return (
                <View style={[s.bubble, mine ? s.mine : s.theirs]}>
                  <Text
                    accessibilityLabel={mine ? 'Your message' : 'Received message'}
                    style={[s.message, mine && { color: '#fff' }]}
                  >
                    {m.isDeleted ? 'Message deleted' : m.type === 'text' ? m.text : ''}
                  </Text>
                  {!m.isDeleted && m.type === 'image' && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open image"
                      onPress={() => Linking.openURL(m.mediaUrl)}
                    >
                      <Image source={{ uri: m.mediaUrl }} style={s.media} contentFit="contain" />
                    </Pressable>
                  )}
                  {!m.isDeleted && m.type === 'video' && (
                    <Video
                      source={{ uri: m.mediaUrl }}
                      style={s.media}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                    />
                  )}
                  {!m.isDeleted && ['audio', 'file'].includes(m.type) && (
                    <Pressable accessibilityRole="link" onPress={() => Linking.openURL(m.mediaUrl)}>
                      <Text
                        style={[
                          s.message,
                          { textDecorationLine: 'underline', color: mine ? '#fff' : p.ink },
                        ]}
                      >
                        {m.text || 'Open attachment'}
                      </Text>
                    </Pressable>
                  )}
                  <View style={s.meta}>
                    <Text style={[s.time, mine && { color: '#E9C6CE' }]}>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {mine
                        ? m.pending
                          ? m.failed
                            ? ' · Not sent'
                            : ' · Sending…'
                          : m.seenBy?.length
                            ? ' · Read'
                            : ' · Sent'
                        : ''}
                    </Text>
                    {mine && !m.isDeleted && !m.pending && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Delete message"
                        disabled={deletingIds.includes(m._id)}
                        aria-busy={deletingIds.includes(m._id)} accessibilityState={{ busy: deletingIds.includes(m._id), disabled: deletingIds.includes(m._id) }}
                        onPress={() => confirmRemove(m)}
                        hitSlop={8}
                      >
                        {deletingIds.includes(m._id) ? <ActivityIndicator size="small" color="#DDE6DE" /> : <Ionicons name="trash-outline" size={14} color="#DDE6DE" />}
                      </Pressable>
                    )}
                  </View>
                  {m.failed && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Retry message"
                      onPress={() => persist(m)}
                    >
                      <Text style={s.retry}>Tap to retry</Text>
                    </Pressable>
                  )}
                </View>
              )
            }}
          />
        )}
        <View style={s.composer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Attach a file"
            onPress={() => setPicker(true)}
            disabled={uploading}
            aria-busy={uploading} accessibilityState={{ busy: uploading, disabled: uploading }}
            style={s.icon}
          >
            {uploading ? (
              <ActivityIndicator color={p.primary} />
            ) : (
              <Ionicons name="add-circle-outline" size={26} color={p.ink} />
            )}
          </Pressable>
          <TextInput
            accessibilityLabel="Message"
            placeholder="Write a message…"
            placeholderTextColor={p.muted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={5000}
            style={s.input}
            onKeyPress={(e: any) => {
              if (
                Platform.OS === 'web' &&
                e.nativeEvent.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.shiftKey
              ) {
                e.preventDefault()
                send()
              }
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!text.trim() || sendingCount > 0}
            aria-busy={sendingCount > 0} accessibilityState={{ busy: sendingCount > 0, disabled: !text.trim() || sendingCount > 0 }}
            onPress={() => send()}
            style={[s.send, !text.trim() && !sendingCount && { opacity: 0.45 }]}
          >
            {sendingCount > 0 ? <ActivityIndicator color="#fff" /> : <Ionicons name="arrow-up" size={23} color="#fff" />}
          </Pressable>
        </View>
        <MediaPicker
          visible={picker}
          onClose={() => setPicker(false)}
          onPickImage={(asset) => attach(asset, 'image')}
          onPickVideo={(asset) => attach(asset, 'video')}
          onPickDocument={(asset) => attach(asset, 'file')}
        />
      </View>
    </KeyboardAvoidingView>
  )
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: p.canvas },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 940,
    alignSelf: 'center',
    backgroundColor: p.canvas,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: p.line,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: p.surface,
    borderBottomWidth: 1,
    borderColor: p.line,
  },
  icon: { padding: 7 },
  avatar: { width: 44, height: 44, borderRadius: 17, backgroundColor: p.sage },
  name: { color: p.ink, fontFamily: displayFont, fontSize: 17, fontWeight: '700' },
  sub: { color: p.muted, fontFamily: displayFont, fontSize: 12, marginTop: 4 },
  notice: { padding: 14, backgroundColor: p.primarySoft, color: p.error, fontFamily: displayFont, fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  system: { alignSelf: 'center', fontFamily: displayFont, fontSize: 12, color: p.muted, padding: 12 },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 18, minWidth: 110 },
  mine: { alignSelf: 'flex-end', backgroundColor: p.dark, borderBottomRightRadius: 4 },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderBottomLeftRadius: 4,
  },
  message: { color: p.ink, fontFamily: displayFont, fontSize: 15, lineHeight: 23 },
  media: { width: 240, height: 180, borderRadius: 10 },
  meta: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  time: { fontFamily: displayFont, fontSize: 10, color: p.muted },
  retry: { color: '#FFD2BD', textDecorationLine: 'underline', paddingTop: 10, fontFamily: displayFont, fontSize: 13 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: p.surface,
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderColor: p.line,
  },
  input: {
    flex: 1,
    backgroundColor: p.canvas,
    borderRadius: 14,
    padding: 13,
    color: p.ink,
    fontFamily: displayFont, fontSize: 15,
    maxHeight: 110,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: p.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
