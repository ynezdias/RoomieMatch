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
  const { matchId } = useLocalSearchParams()
  const { colors } = useTheme()

  const [messages, setMessages] = useState<any[]>([])
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
    
    // Load initial messages
    const loadMessages = async () => {
        try {
            const res = await api.get(`/chat/${matchId}`)
            if (mounted) setMessages(res.data)
        } catch (err) {
            console.log('Error loading chat:', err)
        }
    }
    loadMessages()

    // Connect Socket
    connectSocket(user._id).then((socket) => {
        if (!mounted || !socket) return
        socketRef.current = socket
        socket.emit('joinMatch', matchId)

        socket.on('newMessage', (msg) => {
            setMessages((prev) => [...prev, msg])
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

      // Haptic feedback
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
          
          // Ensure extension
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
      const isMe = item.sender === user._id || item.sender?._id === user._id
      const isDeleted = item.isDeleted

      return (
          <Pressable 
            onLongPress={() => isMe && !isDeleted && deleteMessage(item._id)}
            style={[
              styles.bubble, 
              isMe ? { alignSelf: 'flex-end', backgroundColor: colors.bubbleSelf } 
                   : { alignSelf: 'flex-start', backgroundColor: colors.bubbleOther }
            ]}
          >
              {isDeleted ? (
                  <Text style={{ fontStyle: 'italic', color: '#888' }}>Message deleted</Text>
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
                        <Text style={{ color: isMe ? '#fff' : colors.text }}>{item.text}</Text>
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
        style={[styles.container, { backgroundColor: colors.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ 
          headerTitle: partnerTyping ? 'Typing...' : 'Chat',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text
      }} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        inverted={false} // Depending on your API sort order. Usually DB is oldest first.
        // onEndReached={() => markSeen(messages.map(m => m._id))}
      />

      {uploading && (
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{color: colors.text, marginTop: 10}}>Uploading...</Text>
          </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderTopColor: colors.border }]}>
          <Pressable onPress={() => setPickerVisible(true)} style={styles.iconButton}>
              <Ionicons name="add" size={28} color={colors.primary} />
          </Pressable>

          <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
              value={text}
              onChangeText={handleTyping}
              placeholder="Type a message..."
              placeholderTextColor="#888"
          />

          <Pressable onPress={() => sendMessage()} style={styles.sendButton}>
              <Ionicons name="send" size={24} color={colors.primary} />
          </Pressable>
      </View>

      <MediaPicker 
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onPickImage={(asset) => uploadMedia(asset, 'image')}
          onPickVideo={(asset) => uploadMedia(asset, 'video')}
          onPickDocument={(doc) => uploadMedia(doc, 'file')}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bubble: {
      maxWidth: '80%',
      padding: 10,
      borderRadius: 16,
      marginVertical: 4,
  },
  mediaImage: {
      width: 200,
      height: 200,
      borderRadius: 10,
      marginBottom: 5
  },
  mediaVideo: {
      width: 200,
      height: 200,
      borderRadius: 10,
      marginBottom: 5,
      backgroundColor: '#000'
  },
  metaRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 4
  },
  time: {
      fontSize: 10,
      color: 'rgba(128,128,128, 0.8)'
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderTopWidth: 1,
  },
  input: {
      flex: 1,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginHorizontal: 10,
      maxHeight: 100,
  },
  iconButton: {
      padding: 5
  },
  sendButton: {
      padding: 5
  },
  loadingOverlay: {
      position: 'absolute',
      bottom: 70,
      left: 0, 
      right: 0, 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 10
  }
})
