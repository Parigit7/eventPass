import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../api/axios';

const BookingModal = ({ visible, onClose, event, onBookingComplete, readOnly = false }) => {
    const [selectedTickets, setSelectedTickets] = useState({});
    const [loading, setLoading] = useState(false);

    if (!event) return null;

    const imageUrl = event.image ? `${axiosInstance.defaults.baseURL.replace('/api', '')}${event.image}` : null;

    const updateTicketQuantity = (type, delta, max) => {
        if (readOnly) return;
        const currentQty = selectedTickets[type] || 0;
        const newQty = Math.max(0, Math.min(max, currentQty + delta));
        setSelectedTickets({ ...selectedTickets, [type]: newQty });
    };

    const calculateTotal = () => {
        return event.tickets.reduce((total, ticket) => {
            const qty = selectedTickets[ticket.type] || 0;
            return total + (qty * ticket.price);
        }, 0);
    };

    const handleConfirmBooking = () => {
        if (readOnly) return;
        const total = calculateTotal();
        if (total === 0) {
            Alert.alert('Error', 'Please select at least one ticket');
            return;
        }

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to book these tickets for a total of Rs. ${total}?`)) {
                processBooking();
            }
        } else {
            Alert.alert(
                'Confirm Booking',
                `Are you sure you want to book these tickets for a total of Rs. ${total}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm', onPress: processBooking }
                ]
            );
        }
    };

    const processBooking = async () => {
        setLoading(true);
        try {
            const ticketsToBook = event.tickets
                .filter(t => selectedTickets[t.type] > 0)
                .map(t => ({
                    type: t.type,
                    price: t.price,
                    quantity: selectedTickets[t.type]
                }));

            const response = await axiosInstance.post('/bookings', {
                eventId: event._id,
                tickets: ticketsToBook,
                totalPrice: calculateTotal()
            });

            if (response.data.success) {
                const msg = `Booking Confirmed!\nBooking ID: ${response.data.booking.bookingId}`;
                if (Platform.OS === 'web') {
                    window.alert(msg);
                } else {
                    Alert.alert('Success', msg);
                }
                onBookingComplete();
                onClose();
                setSelectedTickets({});
            }
        } catch (error) {
            Alert.alert('Booking Failed', error.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{readOnly ? 'Event Details' : 'Book Tickets'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        <Image source={imageUrl ? { uri: imageUrl } : null} style={styles.eventImage} />
                        
                        <View style={styles.eventInfo}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar" size={16} color="#FFD301" />
                                <Text style={styles.infoText}>{new Date(event.date).toLocaleDateString()} at {event.time}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="location" size={16} color="#FFD301" />
                                <Text style={styles.infoText}>{event.location}</Text>
                            </View>
                            <Text style={styles.description}>{event.description}</Text>
                        </View>

                        <View style={styles.ticketSection}>
                            <Text style={styles.sectionLabel}>Ticket Options</Text>
                            {event.tickets.map((ticket, index) => (
                                <View key={index} style={styles.ticketRow}>
                                    <View style={styles.ticketInfo}>
                                        <Text style={styles.ticketType}>{ticket.type}</Text>
                                        <Text style={styles.ticketPrice}>Rs. {ticket.price}</Text>
                                        <Text style={styles.ticketAvailability}>
                                            {ticket.remainingQuantity} available
                                        </Text>
                                    </View>
                                    {!readOnly && (
                                        <View style={styles.quantityControls}>
                                            {ticket.remainingQuantity > 0 ? (
                                                <>
                                                    <TouchableOpacity 
                                                        style={styles.qtyBtn} 
                                                        onPress={() => updateTicketQuantity(ticket.type, -1, ticket.remainingQuantity)}
                                                    >
                                                        <Ionicons name="remove" size={20} color="#FFD301" />
                                                    </TouchableOpacity>
                                                    <Text style={styles.qtyText}>{selectedTickets[ticket.type] || 0}</Text>
                                                    <TouchableOpacity 
                                                        style={styles.qtyBtn} 
                                                        onPress={() => updateTicketQuantity(ticket.type, 1, ticket.remainingQuantity)}
                                                    >
                                                        <Ionicons name="add" size={20} color="#FFD301" />
                                                    </TouchableOpacity>
                                                </>
                                            ) : (
                                                <Text style={styles.soldOutTierText}>SOLD OUT</Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {!readOnly && (
                        <View style={styles.modalFooter}>
                            <View style={styles.totalContainer}>
                                <Text style={styles.totalLabel}>Total Price</Text>
                                <Text style={styles.totalAmount}>Rs. {calculateTotal()}</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.confirmBtn} 
                                onPress={handleConfirmBooking}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#111', height: '90%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#222' },
    modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    modalBody: { flex: 1 },
    eventImage: { width: '100%', height: 200, resizeMode: 'cover' },
    eventInfo: { padding: 25 },
    eventTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    infoText: { color: '#AAA', fontSize: 14 },
    description: { color: '#888', fontSize: 14, marginTop: 15, lineHeight: 22 },
    ticketSection: { padding: 25, borderTopWidth: 1, borderTopColor: '#222' },
    sectionLabel: { color: '#FFD301', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
    ticketRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 15, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
    ticketInfo: { flex: 1 },
    ticketType: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    ticketPrice: { color: '#FFD301', fontSize: 14, marginTop: 2 },
    ticketAvailability: { color: '#666', fontSize: 12, marginTop: 4 },
    quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    qtyText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },
    soldOutTierText: { color: '#F44336', fontWeight: 'bold', fontSize: 12 },
    modalFooter: { padding: 25, backgroundColor: '#1A1A1A', borderTopWidth: 1, borderTopColor: '#222', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    totalContainer: { flex: 1 },
    totalLabel: { color: '#888', fontSize: 12 },
    totalAmount: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    confirmBtn: { backgroundColor: '#FFD301', paddingHorizontal: 30, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', minWidth: 160 },
    confirmBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});

export default BookingModal;
