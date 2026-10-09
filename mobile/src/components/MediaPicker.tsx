import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { palette as p, displayFont } from '@/constants/design';
import { FormNotice } from '@/components/app-ui';
import { Ionicons } from '@expo/vector-icons';

type MediaPickerProps = {
    visible: boolean;
    onClose: () => void;
    onPickImage: (asset: ImagePicker.ImagePickerAsset) => void;
    onPickVideo: (asset: ImagePicker.ImagePickerAsset) => void;
    onPickDocument: (asset: DocumentPicker.DocumentPickerAsset) => void;
};

export default function MediaPicker({ visible, onClose, onPickImage, onPickVideo, onPickDocument }: MediaPickerProps) {
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const pending = useRef(false);
    const run = async (label: string, action: () => Promise<void>) => {
        if (pending.current) return;
        pending.current = true; setBusy(label); setError('');
        try { await action(); } catch { setError('Could not open the picker. Please try again.'); }
        finally { pending.current = false; setBusy(''); }
    };
    const colors = { background: p.surface, border: p.line, secondary: p.sage, primary: p.primary, text: p.ink };

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
            setError('Camera permission is required. Please enable it in your device settings.');
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
                        <Option icon="camera" label="Camera" busy={busy === 'Camera'} disabled={!!busy} onPress={() => run('Camera', takePhoto)} colors={colors} />
                        <Option icon="image" label="Gallery" busy={busy === 'Gallery'} disabled={!!busy} onPress={() => run('Gallery', pickImage)} colors={colors} />
                        <Option icon="videocam" label="Video" busy={busy === 'Video'} disabled={!!busy} onPress={() => run('Video', pickVideo)} colors={colors} />
                        <Option icon="document" label="File" busy={busy === 'File'} disabled={!!busy} onPress={() => run('File', pickDocument)} colors={colors} />
                    </View>
                    <FormNotice message={error} />
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

type OptionProps = {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    onPress: () => void | Promise<void>;
    busy: boolean;
    disabled: boolean;
    colors: { background: string; border: string; secondary: string; primary: string; text: string };
};

const Option = ({ icon, label, onPress, colors, busy, disabled }: OptionProps) => (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} aria-busy={busy} accessibilityState={{ busy, disabled }} disabled={disabled} style={styles.option} onPress={onPress}>
        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
            {busy ? <ActivityIndicator color={colors.primary} /> : <Ionicons name={icon} size={24} color={colors.primary} />}
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
        padding: 20, width: '100%', maxWidth: 540, alignSelf: 'center',
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
        fontFamily: displayFont, fontSize: 12,
    }
});
