import { useLocalSearchParams } from 'expo-router'
import { StyleSheet } from 'react-native'
import { Image } from 'expo-image'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

export default function ProfileDetail() {
  const params = useLocalSearchParams()

  return (
    <ThemedView style={styles.container}>
      <Image source={{ uri: params.photo as string }} style={styles.avatar} />

      <ThemedText style={styles.name}>{params.name}</ThemedText>
      <ThemedText style={styles.meta}>
        {params.university} • {params.city}
      </ThemedText>

      <ThemedText style={styles.about}>{params.about}</ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#000',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  meta: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
  },
  about: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
  },
})
