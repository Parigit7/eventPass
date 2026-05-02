import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../api/axios';
import EventCard from '../components/EventCard';
import BookingModal from '../components/BookingModal';
import EventDetailsModal from '../components/EventDetailsModal';
import StatusModal from '../components/StatusModal';

const UserPortal = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('Events');
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [ticketSearch, setTicketSearch] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [statusModal, setStatusModal] = useState({ visible: false, type: '', title: '', message: '', onConfirm: null });

    useEffect(() => {
        const getUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
        };
        getUser();
    }, []);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/events?search=${search}&type=active`);
            setEvents(response.data);
        } catch (error) {
            console.error('Fetch events error:', error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/bookings/my?search=${ticketSearch}`);
            setBookings(response.data);
        } catch (error) {
            console.error('Fetch bookings error:', error);
        } finally {
            setLoading(false);
        }
    }, [ticketSearch]);

    useEffect(() => {
        if (activeTab === 'Events') fetchEvents();
        if (activeTab === 'My Tickets') fetchBookings();
    }, [activeTab, fetchEvents, fetchBookings]);

    const handleLogout = () => {
        setStatusModal({
            visible: true,
            type: 'confirm',
            title: 'Logout',
            message: 'Are you sure you want to log out of your account?',
            onConfirm: async () => {
                await AsyncStorage.clear();
                navigation.replace('Landing');
            }
        });
    };

    const NavItem = ({ name, icon }) => (
        <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => {
                setActiveTab(name);
                setSearch('');
                setTicketSearch('');
            }}
        >
            <Ionicons 
                name={icon} 
                size={22} 
                color={activeTab === name ? '#FFD301' : '#666'} 
            />
            <Text style={[styles.navText, { color: activeTab === name ? '#FFD301' : '#666' }]}>
                {name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.name}>{user?.name.split(' ')[0] || 'User'}</Text>
                </View>

                {activeTab === 'Events' && (
                    <View style={styles.content}>
                        <View style={styles.promoCard}>
                            <Ionicons name="sparkles" size={30} color="#FFD301" style={{marginBottom: 15}} />
                            <Text style={styles.cardTitle}>Find Your Next Event</Text>
                            <Text style={styles.cardSubtitle}>Discover and book the best experiences in town.</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Available Events</Text>
                        
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#666" />
                            <TextInput 
                                style={styles.searchInput} 
                                placeholder="Search events..." 
                                placeholderTextColor="#666"
                                value={search}
                                onChangeText={setSearch}
                                onSubmitEditing={fetchEvents}
                            />
                        </View>

                        {loading ? (
                            <ActivityIndicator color="#FFD301" size="large" style={{ marginTop: 30 }} />
                        ) : (
                            <View style={styles.eventGrid}>
                                {events.map(event => (
                                    <EventCard 
                                        key={event._id}
                                        event={event}
                                        isAdmin={false}
                                        onBook={(e) => { setSelectedEvent(e); setIsBookingModalOpen(true); }}
                                        onView={(e) => { setSelectedEvent(e); setIsDetailsModalOpen(true); }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'My Tickets' && (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>My Ticket Collection</Text>
                        
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#666" />
                            <TextInput 
                                style={styles.searchInput} 
                                placeholder="Search by Event or Booking ID..." 
                                placeholderTextColor="#666"
                                value={ticketSearch}
                                onChangeText={setTicketSearch}
                                onSubmitEditing={fetchBookings}
                            />
                        </View>

                        {loading ? (
                            <ActivityIndicator color="#FFD301" size="large" style={{ marginTop: 30 }} />
                        ) : (
                            <View style={styles.bookingList}>
                                {bookings.map(booking => (
                                    <View key={booking._id} style={styles.bookingCard}>
                                        <View style={styles.bookingHeader}>
                                            <View>
                                                <Text style={styles.bookingId}>ID: {booking.bookingId}</Text>
                                                <Text style={styles.bookingDate}>Booked on {new Date(booking.createdAt).toLocaleDateString()}</Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: booking.status === 'confirmed' ? '#4CAF5022' : '#FF980022' }]}>
                                                <Text style={[styles.statusText, { color: booking.status === 'confirmed' ? '#4CAF50' : '#FF9800' }]}>
                                                    {booking.status.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <View style={styles.bookingEventInfo}>
                                            <Ionicons name="calendar-outline" size={16} color="#FFD301" />
                                            <Text style={styles.bookingEventTitle}>{booking.event?.title || 'Unknown Event'}</Text>
                                        </View>

                                        <View style={styles.ticketDetails}>
                                            {booking.tickets.map((t, idx) => (
                                                <View key={idx} style={styles.ticketRow}>
                                                    <Text style={styles.ticketType}>{t.type} x{t.quantity}</Text>
                                                    <Text style={styles.ticketPrice}>Rs. {t.price * t.quantity}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        <View style={styles.bookingFooter}>
                                            <Text style={styles.totalLabel}>Total Paid</Text>
                                            <Text style={styles.totalValue}>Rs. {booking.totalPrice}</Text>
                                        </View>
                                    </View>
                                ))}
                                {bookings.length === 0 && (
                                    <Text style={styles.emptyText}>No bookings found matching your search.</Text>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'Profile' && (
                    <View style={styles.content}>
                        <View style={styles.profileCard}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={40} color="#000" />
                            </View>
                            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
                        </View>

                        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveTab('My Tickets')}>
                            <Ionicons name="ticket-outline" size={22} color="#FFD301" />
                            <Text style={styles.menuText}>My Tickets</Text>
                            <Ionicons name="chevron-forward" size={18} color="#333" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={22} color="#f44336" />
                            <Text style={styles.logoutText}>Logout from Device</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottomNav}>
                <NavItem name="Events" icon="grid-outline" />
                <NavItem name="My Tickets" icon="ticket-outline" />
                <NavItem name="Profile" icon="person-outline" />
            </View>

            <BookingModal 
                visible={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                event={selectedEvent}
                onBookingComplete={fetchBookings}
            />

            {selectedEvent && (
                <EventDetailsModal 
                    visible={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    event={selectedEvent}
                />
            )}

            <StatusModal 
                visible={statusModal.visible}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onConfirm={statusModal.onConfirm}
                onClose={() => setStatusModal({ ...statusModal, visible: false })}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContent: { padding: 25, paddingBottom: 120 },
    header: { marginTop: 20, marginBottom: 30 },
    greeting: { fontSize: 18, color: '#666' },
    name: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
    content: { flex: 1 },
    promoCard: { backgroundColor: '#1A1A1A', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: '#333', marginBottom: 30 },
    cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD301', marginBottom: 10 },
    cardSubtitle: { fontSize: 14, color: '#888', lineHeight: 20 },
    sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', paddingHorizontal: 15, borderRadius: 15, height: 50, marginBottom: 25, borderWidth: 1, borderColor: '#222' },
    searchInput: { flex: 1, marginLeft: 10, color: '#FFF' },
    
    // Booking Card Styles
    bookingList: { gap: 15 },
    bookingCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#222' },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    bookingId: { color: '#FFD301', fontSize: 16, fontWeight: 'bold' },
    bookingDate: { color: '#666', fontSize: 12, marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    bookingEventInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    bookingEventTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    ticketDetails: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#222', paddingVertical: 12, marginBottom: 15 },
    ticketRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    ticketType: { color: '#888', fontSize: 14 },
    ticketPrice: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { color: '#666', fontSize: 14 },
    totalValue: { color: '#FFD301', fontSize: 20, fontWeight: 'bold' },
    emptyText: { color: '#444', textAlign: 'center', marginTop: 50, fontSize: 16 },

    // Profile Styles
    profileCard: { alignItems: 'center', backgroundColor: '#111', padding: 30, borderRadius: 25, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
    avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFD301', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    profileName: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    profileEmail: { color: '#666', fontSize: 14, marginTop: 5 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 20, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
    menuText: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 15 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', height: 60, borderRadius: 18, marginTop: 20, borderWidth: 1, borderColor: '#f4433633', gap: 10 },
    logoutText: { color: '#f44336', fontSize: 16, fontWeight: 'bold' },

    // Bottom Nav
    bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 85, backgroundColor: '#000', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222', paddingBottom: 20 },
    navItem: { alignItems: 'center', justifyContent: 'center', width: '33%' },
    navText: { fontSize: 10, marginTop: 6, fontWeight: '600' }
});

export default UserPortal;
