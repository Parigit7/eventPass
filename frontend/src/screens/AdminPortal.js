import React, { useEffect, useState, useCallback } from 'react';
import { 
    StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView, 
    ScrollView, TextInput, Image, Alert, Modal, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../api/axios';

const AdminPortal = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [eventType, setEventType] = useState('active'); // 'active' or 'old'
    const [loading, setLoading] = useState(false);
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Form States
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date(Date.now() + 86400000));
    const [image, setImage] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tickets, setTickets] = useState([{ type: 'Standard', price: '', quantity: '' }]);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/events?search=${search}&type=${eventType}`);
            setEvents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [search, eventType]);

    useEffect(() => {
        const getUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
        };
        getUser();
    }, []);

    useEffect(() => {
        if (activeTab === 'Events') {
            fetchEvents();
        }
    }, [activeTab, fetchEvents]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.replace('Landing');
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const addTicketRow = () => {
        setTickets([...tickets, { type: '', price: '', quantity: '' }]);
    };

    const removeTicketRow = (index) => {
        setTickets(tickets.filter((_, i) => i !== index));
    };

    const updateTicketRow = (index, field, value) => {
        const newTickets = [...tickets];
        newTickets[index][field] = value;
        setTickets(newTickets);
    };

    const handleSubmit = async () => {
        if (!title || !location || !description || tickets.some(t => !t.type || !t.price || !t.quantity)) {
            Alert.alert('Error', 'Please fill all fields correctly');
            return;
        }

        setModalLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('location', location);
        formData.append('description', description);
        formData.append('date', date.toISOString());
        formData.append('tickets', JSON.stringify(tickets));

        if (image && !image.startsWith('http')) {
            if (Platform.OS === 'web') {
                try {
                    const response = await fetch(image);
                    const blob = await response.blob();
                    formData.append('image', blob, 'event_banner.jpg');
                } catch (e) {
                    console.error('Image upload failed', e);
                }
            } else {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('image', { uri: image, name: filename, type });
            }
        }

        try {
            if (editingEvent) {
                await axiosInstance.put(`/events/${editingEvent._id}`, formData);
                Alert.alert('Success', 'Event updated successfully');
            } else {
                await axiosInstance.post('/events', formData);
                Alert.alert('Success', 'Event created successfully');
            }
            setIsModalOpen(false);
            resetForm();
            fetchEvents();
        } catch (error) {
            console.error(error.response?.data);
            Alert.alert('Error', error.response?.data?.error || 'Something went wrong');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Delete', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axiosInstance.delete(`/events/${id}`);
                        fetchEvents();
                    } catch (error) {
                        Alert.alert('Error', error.response?.data?.error || 'Failed to delete');
                    }
                }
            }
        ]);
    };

    const resetForm = () => {
        setTitle('');
        setLocation('');
        setDescription('');
        setDate(new Date(Date.now() + 86400000));
        setImage(null);
        setTickets([{ type: 'Standard', price: '', quantity: '' }]);
        setEditingEvent(null);
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        setTitle(event.title);
        setLocation(event.location);
        setDescription(event.description);
        setDate(new Date(event.date));
        setImage(event.image ? `${axiosInstance.defaults.baseURL.replace('/api', '')}${event.image}` : null);
        setTickets(event.tickets.map(({ type, price, quantity }) => ({ type, price: price.toString(), quantity: quantity.toString() })));
        setIsModalOpen(true);
    };

    const NavItem = ({ name, icon }) => (
        <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setActiveTab(name)}
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
            
            {activeTab === 'Dashboard' ? (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>ADMIN PANEL</Text>
                        </View>
                        <Text style={styles.name}>Welcome, {user?.name.split(' ')[0] || 'Admin'}</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Events</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>154</Text>
                            <Text style={styles.statLabel}>Tickets</Text>
                        </View>
                    </View>

                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => { setActiveTab('Events'); setIsModalOpen(true); }}>
                            <View style={styles.actionContent}>
                                <Ionicons name="add-circle-outline" size={24} color="#FFD301" />
                                <Text style={styles.actionButtonText}>Create New Event</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.actionContent}>
                                <Ionicons name="clipboard-outline" size={24} color="#FFD301" />
                                <Text style={styles.actionButtonText}>Manage Reservations</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>System Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : activeTab === 'Events' ? (
                <View style={styles.eventContainer}>
                    <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>Manage Events</Text>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#666" />
                            <TextInput 
                                style={styles.searchInput}
                                placeholder="Search event title..."
                                placeholderTextColor="#666"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                        <View style={styles.filterRow}>
                            <TouchableOpacity 
                                style={[styles.filterBtn, eventType === 'active' && styles.filterBtnActive]}
                                onPress={() => setEventType('active')}
                            >
                                <Text style={[styles.filterBtnText, eventType === 'active' && styles.filterBtnTextActive]}>Active Events</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.filterBtn, eventType === 'old' && styles.filterBtnActive]}
                                onPress={() => setEventType('old')}
                            >
                                <Text style={[styles.filterBtnText, eventType === 'old' && styles.filterBtnTextActive]}>Old Events</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#FFD301" size="large" style={{ marginTop: 50 }} />
                    ) : (
                        <ScrollView contentContainerStyle={styles.eventList}>
                            {events.map((event) => (
                                <View key={event._id} style={styles.eventCard}>
                                    <View style={styles.eventCardContent}>
                                        <Text style={styles.eventCardTitle}>{event.title}</Text>
                                        <Text style={styles.eventCardDate}>
                                            <Ionicons name="calendar-outline" size={14} /> {new Date(event.date).toLocaleDateString()}
                                        </Text>
                                        <Text style={styles.eventCardLocation}>
                                            <Ionicons name="location-outline" size={14} /> {event.location}
                                        </Text>
                                    </View>
                                    <View style={styles.eventActions}>
                                        {eventType === 'active' && (
                                            <>
                                                <TouchableOpacity onPress={() => openEditModal(event)} style={styles.iconBtn}>
                                                    <Ionicons name="create-outline" size={22} color="#FFD301" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDelete(event._id)} style={styles.iconBtn}>
                                                    <Ionicons name="trash-outline" size={22} color="#f44336" />
                                                </TouchableOpacity>
                                            </>
                                        )}
                                        {eventType === 'old' && (
                                            <TouchableOpacity style={styles.iconBtn}>
                                                <Ionicons name="eye-outline" size={22} color="#A0A0A0" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setIsModalOpen(true); }}>
                        <Ionicons name="add" size={32} color="#000" />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.placeholderContent}>
                    <Ionicons name="construct-outline" size={60} color="#333" />
                    <Text style={styles.placeholderText}>{activeTab} Module Coming Soon</Text>
                </View>
            )}

            {/* Event Form Modal */}
            <Modal visible={isModalOpen} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                            <Ionicons name="close" size={28} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{editingEvent ? 'Edit Event' : 'New Event'}</Text>
                        <TouchableOpacity onPress={handleSubmit} disabled={modalLoading}>
                            {modalLoading ? <ActivityIndicator color="#FFD301" /> : <Text style={styles.saveBtn}>Save</Text>}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalForm}>
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="image-outline" size={40} color="#666" />
                                    <Text style={styles.imagePlaceholderText}>Upload Event Banner</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.modalLabel}>Event Title</Text>
                        <TextInput style={styles.modalInput} value={title} onChangeText={setTitle} placeholder="Concert, Festival, etc." placeholderTextColor="#444" />

                        <Text style={styles.modalLabel}>Date</Text>
                        {Platform.OS === 'web' ? (
                            <input 
                                type="date" 
                                value={date.toISOString().split('T')[0]} 
                                onChange={(e) => setDate(new Date(e.target.value))}
                                style={{
                                    backgroundColor: '#1A1A1A',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    color: '#FFF',
                                    marginBottom: '20px',
                                    border: '1px solid #333',
                                    width: '100%',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                                min="1900-01-01"
                            />
                        ) : (
                            <>
                                <TouchableOpacity style={styles.modalInput} onPress={() => setShowDatePicker(true)}>
                                    <Text style={{ color: '#FFF' }}>{date.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        onChange={(e, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) setDate(selectedDate);
                                        }}
                                    />
                                )}
                            </>
                        )}

                        <Text style={styles.modalLabel}>Location</Text>
                        <TextInput style={styles.modalInput} value={location} onChangeText={setLocation} placeholder="City Hall, Stadium, etc." placeholderTextColor="#444" />

                        <Text style={styles.modalLabel}>Description</Text>
                        <TextInput style={[styles.modalInput, { height: 100 }]} value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholder="Describe your event..." placeholderTextColor="#444" />

                        <View style={styles.ticketSection}>
                            <View style={styles.ticketHeader}>
                                <Text style={styles.modalLabel}>Ticket Pricing</Text>
                                <TouchableOpacity onPress={addTicketRow}>
                                    <Ionicons name="add-circle" size={24} color="#FFD301" />
                                </TouchableOpacity>
                            </View>
                            {tickets.map((t, index) => (
                                <View key={index} style={styles.ticketCard}>
                                    <View style={styles.ticketTopRow}>
                                        <TextInput 
                                            style={[styles.modalInput, styles.ticketNameInput]} 
                                            value={t.type} 
                                            onChangeText={(v) => updateTicketRow(index, 'type', v)}
                                            placeholder="Ticket Name (e.g. VIP)"
                                            placeholderTextColor="#444"
                                        />
                                        {tickets.length > 1 && (
                                            <TouchableOpacity onPress={() => removeTicketRow(index)} style={styles.removeBtn}>
                                                <Ionicons name="close-circle" size={24} color="#f44336" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={styles.ticketBottomRow}>
                                        <View style={styles.priceContainer}>
                                            <Text style={styles.inputPrefix}>$</Text>
                                            <TextInput 
                                                style={[styles.modalInput, styles.ticketSubInput]} 
                                                value={t.price} 
                                                onChangeText={(v) => updateTicketRow(index, 'price', v)}
                                                placeholder="Price"
                                                placeholderTextColor="#444"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={styles.qtyContainer}>
                                            <Text style={styles.inputPrefix}>Qty</Text>
                                            <TextInput 
                                                style={[styles.modalInput, styles.ticketSubInput]} 
                                                value={t.quantity} 
                                                onChangeText={(v) => updateTicketRow(index, 'quantity', v)}
                                                placeholder="Quantity"
                                                placeholderTextColor="#444"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <View style={{ height: 50 }} />
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                <NavItem name="Dashboard" icon="grid-outline" />
                <NavItem name="Events" icon="calendar-outline" />
                <NavItem name="Bookings" icon="ticket-outline" />
                <NavItem name="Users" icon="people-outline" />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    scrollContent: { padding: 25, paddingBottom: 100 },
    header: { marginTop: 20, marginBottom: 40 },
    badge: { backgroundColor: '#FFD301', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5, marginBottom: 10 },
    badgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
    name: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
    statsContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    statBox: { flex: 1, backgroundColor: '#1A1A1A', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFD301', marginBottom: 5 },
    statLabel: { fontSize: 14, color: '#A0A0A0' },
    actionContainer: { gap: 15, marginBottom: 40 },
    actionButton: { backgroundColor: '#1A1A1A', height: 70, borderRadius: 15, justifyContent: 'center', paddingHorizontal: 20, borderWidth: 1, borderColor: '#333' },
    actionContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    logoutButton: { backgroundColor: '#1A1A1A', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f4433633' },
    logoutText: { color: '#f44336', fontSize: 16, fontWeight: 'bold' },
    
    // Event Management Styles
    eventContainer: { flex: 1, padding: 20, paddingBottom: 100 },
    eventHeader: { marginBottom: 20 },
    eventTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', height: 50, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
    searchInput: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 14 },
    filterRow: { flexDirection: 'row', gap: 10 },
    filterBtn: { flex: 1, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
    filterBtnActive: { backgroundColor: '#FFD301' },
    filterBtnText: { color: '#666', fontWeight: 'bold' },
    filterBtnTextActive: { color: '#000' },
    eventList: { gap: 12 },
    eventCard: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    eventCardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    eventCardDate: { color: '#A0A0A0', fontSize: 12, marginTop: 4 },
    eventCardLocation: { color: '#666', fontSize: 12, marginTop: 2 },
    eventActions: { flexDirection: 'row', gap: 10 },
    iconBtn: { padding: 5 },
    fab: { position: 'absolute', bottom: 100, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFD301', justifyContent: 'center', alignItems: 'center', elevation: 5 },

    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#000' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
    modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    saveBtn: { color: '#FFD301', fontSize: 16, fontWeight: 'bold' },
    modalForm: { padding: 20 },
    imagePicker: { width: '100%', height: 200, backgroundColor: '#1A1A1A', borderRadius: 15, overflow: 'hidden', marginBottom: 25, justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center' },
    imagePlaceholderText: { color: '#666', marginTop: 10 },
    modalLabel: { color: '#A0A0A0', fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
    modalInput: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 15, color: '#FFF', marginBottom: 20, borderWidth: 1, borderColor: '#333', justifyContent: 'center' },
    ticketSection: { marginTop: 10 },
    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    ticketCard: { backgroundColor: '#111', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
    ticketTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    ticketNameInput: { flex: 1, marginBottom: 0, height: 45 },
    ticketBottomRow: { flexDirection: 'row', gap: 10 },
    priceContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#333', paddingLeft: 12 },
    qtyContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#333', paddingLeft: 12 },
    inputPrefix: { color: '#FFD301', fontSize: 14, fontWeight: 'bold' },
    ticketSubInput: { flex: 1, backgroundColor: 'transparent', borderWidth: 0, marginBottom: 0, height: 45, paddingLeft: 8 },
    removeBtn: { padding: 5 },

    // Bottom Nav Styles
    bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#0A0A0A', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222', paddingBottom: 15 },
    navItem: { alignItems: 'center', justifyContent: 'center' },
    navText: { fontSize: 11, marginTop: 5, fontWeight: '500' },
    placeholderContent: { flex: 1, height: 400, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#666', fontSize: 16, marginTop: 20, fontWeight: '500' }
});

export default AdminPortal;
