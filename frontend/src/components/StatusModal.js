import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatusModal = ({ visible, type, title, message, onConfirm, onClose, confirmText = "OK", cancelText = "Cancel" }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: '#4CAF50' };
            case 'error': return { name: 'alert-circle', color: '#F44336' };
            case 'confirm': return { name: 'help-circle', color: '#FFD301' };
            default: return { name: 'information-circle', color: '#2196F3' };
        }
    };

    const icon = getIcon();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                        <Ionicons name={icon.name} size={50} color={icon.color} />
                    </View>
                    
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.footer}>
                        {type === 'confirm' && (
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelBtnText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[styles.confirmBtn, { backgroundColor: type === 'error' ? '#F44336' : '#FFD301' }]} 
                            onPress={onConfirm || onClose}
                        >
                            <Text style={[styles.confirmBtnText, { color: type === 'error' ? '#FFF' : '#000' }]}>
                                {type === 'confirm' ? confirmText : 'Got it'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '85%', backgroundColor: '#111', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
    iconContainer: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    title: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    message: { color: '#888', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
    footer: { flexDirection: 'row', gap: 12, width: '100%' },
    confirmBtn: { flex: 1, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    confirmBtnText: { fontWeight: 'bold', fontSize: 16 },
    cancelBtn: { flex: 1, height: 55, borderRadius: 15, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    cancelBtnText: { color: '#888', fontWeight: 'bold', fontSize: 16 }
});

export default StatusModal;
