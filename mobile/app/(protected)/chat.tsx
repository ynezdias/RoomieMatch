import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal
} from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Video, ResizeMode } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as Haptics from 'expo-haptics'

import api from '@/services/api'
import { connectSocket } from '@/src/sockets'
import { useAuth } from '@/src/context/AuthContext'
import { useTheme } from '@/src/context/ThemeContext'
import MediaPicker from '@/src/components/MediaPicker'

export default function ChatScreen() {
  const { user } = useAuth()
  const { matchId, initialMessage } = useLocalSearchParams()
  const { colors } = useTheme()
  const router = useRouter()

  const [messages, setMessages] = useState<any[]>([])
  const [partner, setPartner] = useState<any>(null)
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [pickerVisible, setPickerVisible] = useState(false)
  const [uploading, setUploading] = useState(false)

  const socketRef = useRef<any>(null)
  const typingTimeoutRef = useRef<any>(null)
  
  /* ===================== SETUP ===================== */
  
  useEffect(() => {
    if (!user || !matchId) return

    let mounted = true
    
    // Load partner details for header
    const loadPartner = async () => {
        try {
            const res = await api.get(`/chat/match/${matchId}`)
            if (mounted) setPartner(res.data.partner)
        } catch (err) {
            console.log('Error loading partner:', err)
        }
    }

    // Load initial messages
    const loadMessages = async () => {
        try {
            const res = await api.get(`/chat/${matchId}`)
            if (mounted) setMessages(res.data)
        } catch (err) {
            console.log('Error loading chat:', err)
        }
    }

    loadPartner()
    loadMessages()

    // Connect Socket
    connectSocket(user._id).then((socket) => {
        if (!mounted || !socket) return
        socketRef.current = socket
        socket.emit('joinMatch', matchId)

        // 🔥 AUTO-SEND INITIAL MESSAGE IF PROVIDED
        if (initialMessage && typeof initialMessage === 'string') {
            setTimeout(() => {
                setMessages(prev => {
                    const alreadySent = prev.some(m => m.text === initialMessage && (m.sender === user._id || m.sender?._id === user._id))
                    if (!alreadySent) {
                        sendMessage(initialMessage)
                    }
                    return prev
                })
            }, 1000)
        }

        socket.on('newMessage', (msg) => {
            setMessages((prev) => [msg, ...prev]) // Push to front for inverted list
            markSeen([msg._id])
        })

        socket.on('typing', ({ userId }) => {
            if (userId !== user._id) setPartnerTyping(true)
        })

        socket.on('stopTyping', ({ userId }) => {
            if (userId !== user._id) setPartnerTyping(false)
        })

        socket.on('messageSeen', ({ messageIds, seenBy }) => {
             setMessages(prev => prev.map(msg => 
                 messageIds.includes(msg._id) 
                 ? { ...msg, seenBy: [...(msg.seenBy || []), seenBy] }
                 : msg
             ))
        })

        socket.on('messageDeleted', ({ messageId }) => {
            setMessages(prev => prev.map(msg => 
                msg._id === messageId ? { ...msg, isDeleted: true } : msg
            ))
        })
    })

    return () => {
        mounted = false
        if (socketRef.current) {
            socketRef.current.off('newMessage')
            socketRef.current.off('typing')
            socketRef.current.off('stopTyping')
            socketRef.current.off('messageSeen')
            socketRef.current.off('messageDeleted')
        }
    }
  }, [matchId, user])

  /* ===================== ACTIONS ===================== */

  const markSeen = useCallback((ids) => {
      if (!socketRef.current || ids.length === 0) return
      socketRef.current.emit('markSeen', { matchId, messageIds: ids })
  }, [matchId])

  const handleTyping = (val) => {
      setText(val)
      
      if (!socketRef.current) return

      if (!isTyping) {
          setIsTyping(true)
          socketRef.current.emit('typing', { matchId })
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

      typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
          socketRef.current.emit('stopTyping', { matchId })
      }, 1500)
  }

  const sendMessage = async (content = text, type = 'text', mediaUrl = null) => {
      if (!socketRef.current) return
      if (type === 'text' && !content.trim()) return

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      socketRef.current.emit('sendMessage', {
          matchId,
          text: content,
          type,
          mediaUrl
      })

      if (type === 'text') setText('')
  }

  const deleteMessage = (messageId) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      Alert.alert('Delete Message', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { 
              text: 'Delete', 
              style: 'destructive', 
              onPress: () => {
                  socketRef.current.emit('deleteMessage', { matchId, messageId })
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              }
          }
      ])
  }

  const uploadMedia = async (asset, type) => {
      try {
          setUploading(true)
          
          let uri = asset.uri
          let name = asset.fileName || asset.name || `upload_${Date.now()}`
          let mimeType = asset.mimeType 
          
          if (!mimeType) {
             if (type === 'video') mimeType = 'video/mp4'
             else if (type === 'image') mimeType = 'image/jpeg'
          }
          
          if (!name.includes('.')) {
              const ext = mimeType?.split('/')[1] || (type === 'video' ? 'mp4' : 'jpg')
              name = `${name}.${ext}`
          }

          const formData = new FormData()
          formData.append('file', {
              uri,
              name,
              type: mimeType || (type === 'video' ? 'video/mp4' : 'image/jpeg'),
          } as any)

          const res = await api.post('/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          })

          sendMessage('', type, res.data.url)
      } catch (err) {
          Alert.alert('Upload Failed', 'Could not upload media')
          console.error(err)
      } finally {
          setUploading(false)
      }
  }

  /* ===================== RENDER ===================== */

  const renderItem = ({ item }) => {
      const senderId = item.sender?._id || item.sender
      const isMe = senderId === user?._id
      const isDeleted = item.isDeleted
      const isSystem = item.type === 'system'

      if (isSystem) {
          return (
              <View style={styles.systemContainer}>
                  <Text style={styles.systemText}>{item.text}</Text>
              </View>
          )
      }

      return (
          <Pressable 
            onLongPress={() => isMe && !isDeleted && deleteMessage(item._id)}
            style={[
              styles.bubble, 
              isMe ? { alignSelf: 'flex-end', backgroundColor: '#3b82f6', borderBottomRightRadius: 4 } 
                   : { alignSelf: 'flex-start', backgroundColor: '#1e293b', borderBottomLeftRadius: 4 }
            ]}
          >
              {isDeleted ? (
                  <Text style={{ fontStyle: 'italic', color: '#94a3b8' }}>Message deleted</Text>
              ) : (
                  <>
                    {item.type === 'image' && (
                        <Image source={{ uri: item.mediaUrl }} style={styles.mediaImage} contentFit="cover" />
                    )}
                    {item.type === 'video' && (
                        <Video 
                            source={{ uri: item.mediaUrl }}
                            style={styles.mediaVideo}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                        />
                    )}
                    {!!item.text && (
                        <Text style={{ color: '#fff', fontSize: 16 }}>{item.text}</Text>
                    )}
                    
                    <View style={styles.metaRow}>
                        <Text style={styles.time}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isMe && (
                            <Ionicons 
                                name={item.seenBy?.length > 0 ? "checkmark-done" : "checkmark"} 
                                size={14} 
                                color={item.seenBy?.length > 0 ? "#4DD0E1" : "rgba(255,255,255,0.7)"} 
                                style={{ marginLeft: 4 }}
                            />
                        )}
                    </View>
                  </>
              )}
          </Pressable>
      )
  }

  return (
    <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: '#020617' }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ 
          headerLeft: () => (
            <View style={styles.headerPartner}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Image 
                    source={{ uri: partner?.photo || `https://ui-avatars.com/api/?name=${partner?.name}` }} 
                    style={styles.headerAvatar}
                />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.headerName} numberOfLines={1}>{partner?.name || 'Loading...'}</Text>
                    <Text style={styles.headerSub} numberOfLines={1}>{partnerTyping ? 'Typing...' : partner?.email?.split('@')[0] || partner?.name?.toLowerCase().replace(' ', '.')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={12} color="#94a3b8" style={{ marginLeft: 4 }} />
            </View>
          ),
          headerTitle: '',
          headerStyle: { backgroundColor: '#020617' },
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerActionBtn}>
                    <Ionicons name="call-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerActionBtn}>
                    <Ionicons name="videocam-outline" size={26} color="#fff" />
                </TouchableOpacity>
            </View>
          )
      }} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
        inverted={true}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomBar}>
          <View style={[styles.inputContainer, { backgroundColor: '#1e293b' }]}>
              <TouchableOpacity style={styles.cameraBtn} onPress={() => setPickerVisible(true)}>
                  <View style={styles.cameraIconBg}>
                      <Ionicons name="camera" size={20} color="#fff" />
                  </View>
              </TouchableOpacity>
              
              <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={handleTyping}
                  placeholder="Message..."
                  placeholderTextColor="#94a3b8"
                  multiline
              />

              {text.trim() ? (
                <TouchableOpacity onPress={() => sendMessage()} style={styles.sendTextBtn}>
                    <Text style={styles.sendTextLabel}>Send</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.inputIconsRight}>
                    <TouchableOpacity style={styles.inputActionIcon}>
                        <Ionicons name="mic-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputActionIcon} onPress={() => setPickerVisible(true)}>
                        <Ionicons name="image-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputActionIcon}>
                        <Ionicons name="happy-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inputActionIcon}>
                        <Ionicons name="add-circle-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
              )}
          </View>
      </View>

      <MediaPicker 
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onPickImage={(asset) => uploadMedia(asset, 'image')}
          onPickVideo={(asset) => uploadMedia(asset, 'video')}
          onPickDocument={(doc) => uploadMedia(doc, 'file')}
      />

      {uploading && (
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#3b82f6" />
          </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPartner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 4,
  },
  headerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#1e293b',
  },
  headerName: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
  },
  headerSub: {
      color: '#94a3b8',
      fontSize: 12,
  },
  headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  headerActionBtn: {
      marginLeft: 20,
  },
  bubble: {
      maxWidth: '75%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      marginVertical: 2,
  },
  mediaImage: {
      width: 200,
      height: 200,
      borderRadius: 18,
      marginBottom: 5
  },
  mediaVideo: {
      width: 200,
      height: 200,
      borderRadius: 18,
      marginBottom: 5,
      backgroundColor: '#000'
  },
  metaRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 2
  },
  time: {
      fontSize: 10,
      color: 'rgba(255,255,255, 0.4)'
  },
  bottomBar: {
      paddingHorizontal: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
      paddingTop: 8,
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 24,
      paddingHorizontal: 4,
  },
  cameraBtn: {
    padding: 4,
  },
  cameraIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
      flex: 1,
      color: '#fff',
      fontSize: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      maxHeight: 120,
  },
  inputIconsRight: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 8,
  },
  inputActionIcon: {
      marginLeft: 12,
  },
  sendTextBtn: {
    paddingHorizontal: 16,
  },
  sendTextLabel: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 100,
  },
  systemContainer: {
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginVertical: 12,
  },
  systemText: {
      fontSize: 12,
      color: '#64748b',
      fontWeight: '600',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 1,
  }
})
