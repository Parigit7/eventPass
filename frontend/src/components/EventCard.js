import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../api/axios';

const EventCard = ({ event, eventType, onEdit, onDelete, onView }) => {
    const imageUrl = event.image ? `${axiosInstance.defaults.baseURL.replace('/api', '')}${event.image}` : null;

    return (
        <View style={styles.eventCard}>
            <Image 
                source={imageUrl ? { uri: imageUrl } : null} 
                style={styles.eventImage} 
            />
            <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color="#888" />
                    <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString()} at {event.time || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color="#888" />
                    <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
            </View>
            <View style={styles.eventActions}>
                {eventType === 'active' ? (
                    <>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(event)}>
                            <Ionicons name="create-outline" size={22} color="#FFD301" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(event._id)}>
                            <Ionicons name="trash-outline" size={22} color="#f44336" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.iconBtn} onPress={() => onView(event)}>
                        <Ionicons name="eye-outline" size={22} color="#A0A0A0" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    eventCard: { 
        backgroundColor: '#111', 
        borderRadius: 15, 
        padding: 12, 
        marginBottom: 15, 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#222' 
    },
    eventImage: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#222' },
    eventInfo: { flex: 1, marginLeft: 15 },
    eventTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
    eventDate: { color: '#888', fontSize: 12 },
    eventLocation: { color: '#888', fontSize: 12 },
    eventActions: { flexDirection: 'row', gap: 10 },
    iconBtn: { padding: 8, backgroundColor: '#1A1A1A', borderRadius: 8 },
});

export default EventCard;
