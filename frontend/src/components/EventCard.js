import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../api/axios';

const { width } = Dimensions.get('window');

const EventCard = ({ event, eventType, onEdit, onDelete, onView, isAdmin = true, onBook }) => {
    const imageUrl = event.image ? `${axiosInstance.defaults.baseURL.replace('/api', '')}${event.image}` : null;

    return (
        <View style={styles.eventCard}>
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => onView(event)}
            >
                <Image 
                    source={imageUrl ? { uri: imageUrl } : null} 
                    style={styles.eventImage} 
                    resizeMode="cover"
                />
                
                <View style={styles.cardContent}>
                    <View style={styles.mainInfo}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        
                        <View style={styles.detailsGrid}>
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={14} color="#FFD301" />
                                <Text style={styles.eventDetailText}>
                                    {new Date(event.date).toLocaleDateString()} at {event.time || 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={14} color="#FFD301" />
                                <Text style={styles.eventDetailText} numberOfLines={1}>{event.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            <View style={[styles.cardContent, { paddingTop: 0 }]}>
                <View style={styles.eventActions}>
                    {isAdmin ? (
                        eventType === 'active' ? (
                            <>
                                <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => onEdit(event)}>
                                    <Ionicons name="create-outline" size={18} color="#000" />
                                    <Text style={styles.btnText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(event._id)}>
                                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                                    <Text style={[styles.btnText, { color: '#FFF' }]}>Delete</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={[styles.actionBtn, styles.viewBtn]} onPress={() => onView(event)}>
                                <Ionicons name="eye-outline" size={18} color="#FFF" />
                                <Text style={[styles.btnText, { color: '#FFF' }]}>View Details</Text>
                            </TouchableOpacity>
                        )
                    ) : (
                        <View style={{ width: '100%', gap: 10 }}>
                            {/* View Details Button */}
                            <TouchableOpacity 
                                style={[styles.actionBtn, styles.viewBtn]} 
                                onPress={() => onView(event)}
                            >
                                <Ionicons name="eye-outline" size={18} color="#FFF" />
                                <Text style={[styles.btnText, { color: '#FFF' }]}>View Details</Text>
                            </TouchableOpacity>

                            {/* Book Now Button */}
                            {event.tickets.reduce((acc, t) => acc + t.remainingQuantity, 0) === 0 ? (
                                <View style={[styles.actionBtn, { backgroundColor: '#333' }]}>
                                    <Text style={[styles.btnText, { color: '#888' }]}>SOLD OUT</Text>
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    style={[styles.actionBtn, styles.editBtn]} 
                                    onPress={() => onBook(event)}
                                >
                                    <Ionicons name="ticket-outline" size={18} color="#000" />
                                    <Text style={styles.btnText}>Book Now</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    eventCard: { 
        backgroundColor: '#111', 
        borderRadius: 20, 
        marginBottom: 25, 
        overflow: 'hidden',
        borderWidth: 1, 
        borderColor: '#222',
        elevation: 5,
        boxShadow: '0px 10px 15px rgba(0,0,0,0.3)',
    },
    eventImage: { 
        width: '100%', 
        height: 180, 
        backgroundColor: '#1A1A1A' 
    },
    cardContent: { 
        padding: 20 
    },
    mainInfo: { 
        marginBottom: 20 
    },
    eventTitle: { 
        color: '#FFF', 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 12 
    },
    detailsGrid: { 
        gap: 8 
    },
    infoRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8 
    },
    eventDetailText: { 
        color: '#AAA', 
        fontSize: 14 
    },
    eventActions: { 
        flexDirection: 'row', 
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
        paddingTop: 20
    },
    actionBtn: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 12, 
        borderRadius: 12,
        gap: 8
    },
    editBtn: { 
        backgroundColor: '#FFD301' 
    },
    deleteBtn: { 
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#333'
    },
    viewBtn: { 
        backgroundColor: '#333' 
    },
    btnText: { 
        fontSize: 14, 
        fontWeight: 'bold',
        color: '#000'
    },
});

export default EventCard;
