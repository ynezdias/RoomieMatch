import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import api from '../../services/api';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileOverlayProps {
  visible: boolean;
  onClose: () => void;
  profile: any;
}

const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ visible, onClose, profile }) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  if (!profile) return null;

  const handleChat = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/chat/get-or-create/${profile.userId?._id}`);
      const { matchId } = res.data;

      onClose();
      // @ts-ignore
      router.push({
        pathname: '/chat',
        params: { 
          matchId: matchId.toString(),
          initialMessage: `Hi - ${profile.userId?.name}`
        }
      });
    } catch (err) {
      console.error('Chat error:', err);
      Alert.alert('Error', 'Could not open chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderInfoTag = (icon: any, label: string, value: string | number | boolean) => {
    let displayValue = value;
    if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    }

    return (
      <View style={styles.tag}>
        <Ionicons name={icon} size={16} color="#ce0000" />
        <View style={styles.tagContent}>
          <Text style={styles.tagLabel}>{label}</Text>
          <Text style={styles.tagValue}>{displayValue}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* PHOTO HEADER */}
            <View style={styles.imageContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: profile.photo || `https://ui-avatars.com/api/?name=${profile.userId?.name}&size=512&background=random`,
                  }}
                  style={styles.headerImage}
                  resizeMode="cover"
                />
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <BlurView intensity={80} tint="dark" style={styles.closeBlur}>
                  <Ionicons name="close" size={24} color="#fff" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* INFO BODY */}
            <View style={styles.body}>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{profile.userId?.name}</Text>
                <Text style={styles.location}>
                  <Ionicons name="location" size={14} color="#9ca3af" /> {profile.city}
                </Text>
              </View>

              <View style={styles.universityBox}>
                <Ionicons name="school" size={16} color="#60a5fa" />
                <Text style={styles.universityText}>{profile.university}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Me</Text>
                <Text style={styles.aboutText}>{profile.aboutMe || "No description provided."}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.tagsContainer}>
                  {renderInfoTag('cash-outline', 'Budget', `$${profile.budget}`)}
                  {renderInfoTag('ban', 'Smoking', profile.smoking)}
                  {renderInfoTag('paw-outline', 'Pets', profile.pets)}
                  {renderInfoTag('bed-outline', 'Furniture', profile.furniture)}
                </View>
              </View>


              <TouchableOpacity 
                style={[styles.chatButton, loading && styles.disabledButton]} 
                onPress={handleChat}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                    <Text style={styles.chatButtonText}>Chat Now</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  content: {
    backgroundColor: '#0f172a',
    borderRadius: 32,
    width: SCREEN_WIDTH * 0.85,
    maxHeight: SCREEN_HEIGHT * 0.7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ce0000',
    padding: 2,
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeBlur: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  body: {
    padding: 24,
  },
  headerInfo: {
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  location: {
    fontSize: 15,
    color: '#9ca3af',
    marginTop: 4,
  },
  universityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  universityText: {
    color: '#60a5fa',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagContent: {
    marginLeft: 10,
  },
  tagLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  tagValue: {
    fontSize: 14,
    color: '#f1f5f9',
    fontWeight: '600',
    marginTop: 2,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ce0000',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 28,
    gap: 8,
    shadowColor: '#ce0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#1e293b',
  },
});

export default ProfileOverlay;
