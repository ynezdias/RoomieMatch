import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function MediaPicker({ visible, onClose, onPickImage, onPickVideo, onPickDocument }) {
    const { colors } = useTheme();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled) {
            onPickImage(result.assets[0]);
            onClose();
        }
    };

    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            onPickVideo(result.assets[0]);
            onClose();
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                onPickDocument(result.assets[0]);
                onClose();
            }
        } catch (e) {
            console.log(e);
        }
    };

    const takePhoto = async () => {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            onPickImage(result.assets[0]);
            onClose();
        }
    }

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={styles.grid}>
                        <Option icon="camera" label="Camera" onPress={takePhoto} colors={colors} />
                        <Option icon="image" label="Gallery" onPress={pickImage} colors={colors} />
                        <Option icon="videocam" label="Video" onPress={pickVideo} colors={colors} />
                        <Option icon="document" label="File" onPress={pickDocument} colors={colors} />
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const Option = ({ icon, label, onPress, colors }) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
            <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderBottomWidth: 0,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    option: {
        alignItems: 'center',
        margin: 10,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
    }
});
