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
  Modal,
  TouchableOpacity
} from 'react-native'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Video, ResizeMode } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'

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

        socket.on('newMessage', (msg) => {
            setMessages((prev) => {
                // If it's a message from ME, check if it matches an optimistic temp message
                if (msg.sender === user._id || msg.sender?._id === user._id) {
                    const exists = prev.some(m => m.isTemp && m.text === msg.text && m.type === msg.type)
                    if (exists) {
                        return prev.map(m => (m.isTemp && m.text === msg.text) ? msg : m)
                    }
                }
                
                // Avoid duplication if message already exists (e.g. from a reload)
                if (prev.some(m => m._id === msg._id)) return prev
                
                return [msg, ...prev]
            })
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

      // Optimistic Update
      const tempId = `temp-${Date.now()}`
      const newMessage = {
          _id: tempId,
          matchId,
          sender: user?._id,
          text: content,
          type,
          mediaUrl,
          createdAt: new Date().toISOString(),
          seenBy: [],
          isTemp: true
      }

      setMessages(prev => [newMessage, ...prev])

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
              isMe ? styles.myBubble : styles.partnerBubble
            ]}
          >
              {isMe && <LinearGradient colors={['#6366f1', '#4f46e5']} style={StyleSheet.absoluteFillObject} /> }
              {isDeleted ? (
                  <Text style={{ fontStyle: 'italic', color: isMe ? 'rgba(255,255,255,0.7)' : '#8696a0' }}>Message deleted</Text>
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
                        <Text style={{ color: isMe ? '#fff' : '#e9edef', fontSize: 16 }}>{item.text}</Text>
                    )}
                    
                    <View style={styles.metaRow}>
                        <Text style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.7)' : '#8696a0' }]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </Text>
                        {isMe && (
                            <Ionicons 
                                name="checkmark-done" 
                                size={16} 
                                color={item.seenBy?.length > 0 ? "#53bdeb" : "rgba(255,255,255,0.5)"} 
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
    <View style={[styles.container, { backgroundColor: '#020617' }]}>
    <LinearGradient colors={['#020617', '#1e1b4b']} style={StyleSheet.absoluteFillObject} />
    <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 95 : 0}
    >
      <Stack.Screen options={{ 
          headerLeft: () => (
            <View style={styles.headerPartner}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Image 
                    source={{ uri: partner?.photo || `https://ui-avatars.com/api/?name=${partner?.name}` }} 
                    style={styles.headerAvatar}
                />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.headerName} numberOfLines={1}>{partner?.name || 'Loading...'}</Text>
                    <Text style={styles.headerSub} numberOfLines={1}>{partnerTyping ? 'typing...' : 'online'}</Text>
                </View>
            </View>
          ),
          headerTitle: '',
          headerStyle: { backgroundColor: '#0b141a' },
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerActionBtn}>
                    <Ionicons name="videocam" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerActionBtn}>
                    <Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerActionBtn}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
          )
      }} />

      <Image 
        source={{ uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' }} 
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        alpha={0.05}
      />

      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
        inverted={true}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomBar}>
          <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.emojiBtn}>
                  <Ionicons name="happy-outline" size={24} color="#85959f" />
              </TouchableOpacity>
              
              <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={handleTyping}
                  placeholder="Message"
                  placeholderTextColor="#85959f"
                  multiline
              />

              <TouchableOpacity style={styles.attachBtn}>
                  <Ionicons name="attach" size={24} color="#85959f" style={{ transform: [{ rotate: '315deg' }] }} />
              </TouchableOpacity>
              
              {!text.trim() && (
                  <TouchableOpacity style={styles.attachBtn} onPress={() => setPickerVisible(true)}>
                      <Ionicons name="camera" size={24} color="#85959f" />
                  </TouchableOpacity>
              )}
          </View>

          <TouchableOpacity 
            onPress={() => text.trim() ? sendMessage() : null} 
            style={[styles.micBtn, { backgroundColor: text.trim() ? '#00a884' : '#00a884' }]}
          >
              <Ionicons name={text.trim() ? "send" : "mic"} size={22} color="#fff" />
          </TouchableOpacity>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPartner: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  headerAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#1e293b',
      borderWidth: 1.5,
      borderColor: '#6366f1',
  },
  headerName: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '800',
  },
  headerSub: {
      color: '#a5b4fc',
      fontSize: 12,
      fontWeight: '600',
  },
  headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  headerActionBtn: {
      marginLeft: 18,
  },
  bubble: {
      maxWidth: '85%',
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginVertical: 4,
      borderRadius: 20,
      overflow: 'hidden',
  },
  myBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  partnerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mediaImage: {
      width: 260,
      height: 200,
      borderRadius: 12,
      marginBottom: 6
  },
  mediaVideo: {
      width: 260,
      height: 200,
      borderRadius: 12,
      marginBottom: 6,
      backgroundColor: '#000'
  },
  metaRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 4,
  },
  time: {
      fontSize: 10,
      color: '#85959f'
  },
  bottomBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 12,
      paddingBottom: Platform.OS === 'ios' ? 30 : 12,
      paddingTop: 8,
  },
  inputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(30, 41, 59, 0.7)',
      borderRadius: 28,
      paddingHorizontal: 12,
      marginRight: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emojiBtn: {
      padding: 6,
  },
  attachBtn: {
      padding: 6,
  },
  input: {
      flex: 1,
      color: '#fff',
      fontSize: 16,
      paddingHorizontal: 8,
      paddingVertical: 12,
      maxHeight: 120,
  },
  micBtn: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#6366f1',
      elevation: 6,
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
  },
  loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.7)',
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 100,
  },
  systemContainer: {
      alignSelf: 'center',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      marginVertical: 16,
      borderWidth: 1,
      borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  systemText: {
      fontSize: 12,
      color: '#a5b4fc',
      fontWeight: '600',
      textAlign: 'center',
  }
})
