import { displayFont } from '@/constants/design'
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Button, FormNotice } from '@/components/app-ui';
import api from '../../services/api';

interface ProfileOverlayProps {
  visible: boolean;
  onClose: () => void;
  profile: any;
}

const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ visible, onClose, profile }) => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => { setError(''); }, [profile]);

  if (!profile) return null;

  const handleChat = async () => {
    if (loading) return;
    setError('');
    try {
      setLoading(true);
      const res = await api.post(`/chat/get-or-create/${profile.userId?._id}`);
      const { matchId } = res.data;

      onClose();
      // @ts-ignore
      router.push({
        pathname: '/(protected)/chat',
        params: { 
          matchId: matchId.toString(),
          initialMessage: `Hi - ${profile.userId?.name}`
        }
      });
    } catch {
      setError('Could not open chat. Please try again.');
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
        <Ionicons name={icon} size={16} color="#F27886" />
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
        
        <View style={[styles.content, { width: Math.min(width * 0.9, 560), maxHeight: height * 0.85 }]}>
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
              <TouchableOpacity accessibilityLabel="Close profile details" style={styles.closeButton} onPress={onClose}>
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
                  <Ionicons name="location" size={14} color="#AEA6AB" /> {profile.city}{profile.state ? `, ${profile.state}` : ''}
                </Text>
              </View>

              <View style={styles.universityBox}>
                <Ionicons name="school" size={16} color="#F5EEEE" />
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


              <View style={{ marginTop: 28 }}><Button title="Chat Now" icon="chatbubble-ellipses" onPress={handleChat} loading={loading} loadingLabel="Opening chat…" /></View>
              <FormNotice message={error} />

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
    backgroundColor: '#1B171C',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3A3038',
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
    backgroundColor: '#2C2026',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#C93B4F',
    padding: 2,
    backgroundColor: '#1B171C',
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
    fontFamily: displayFont, fontSize: 28,
    fontWeight: '800',
    color: '#F5EEEE',
    letterSpacing: -0.5,
  },
  location: {
    fontFamily: displayFont, fontSize: 15,
    color: '#AEA6AB',
    marginTop: 4,
  },
  universityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2026',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  universityText: {
    color: '#F5EEEE',
    marginLeft: 6,
    fontWeight: '600',
    fontFamily: displayFont, fontSize: 14,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: displayFont, fontSize: 18,
    fontWeight: '700',
    color: '#F5EEEE',
    marginBottom: 12,
  },
  aboutText: {
    fontFamily: displayFont, fontSize: 15,
    color: '#AEA6AB',
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
    backgroundColor: '#2C2026',
    padding: 12,
    borderRadius: 16,
    width: '45%',
    borderWidth: 1,
    borderColor: '#3A3038',
  },
  tagContent: {
    marginLeft: 10,
  },
  tagLabel: {
    fontFamily: displayFont, fontSize: 10,
    color: '#AEA6AB',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  tagValue: {
    fontFamily: displayFont, fontSize: 14,
    color: '#F5EEEE',
    fontWeight: '600',
    marginTop: 2,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C93B4F',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 28,
    gap: 8,
    shadowColor: '#C93B4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButtonText: {
    color: '#fff',
    fontFamily: displayFont, fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#2C2026',
  },
});

export default ProfileOverlay;
