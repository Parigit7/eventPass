import React, { useEffect, useState, useCallback } from 'react';
import { 
    StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView, 
    ScrollView, TextInput, Alert, ActivityIndicator, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '../api/axios';

// Components
import BottomNav from '../components/BottomNav';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';

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
    const [stats, setStats] = useState({ activeEvents: 0, pastEvents: 0, totalBookings: 0 });
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('18:00');
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

    const fetchStats = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/events/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Stats fetch failed:', error);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const response = await axiosInstance.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Users fetch failed:', error);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    const toggleUserStatus = async (userId) => {
        try {
            const response = await axiosInstance.put(`/auth/users/${userId}/toggle`);
            if (response.data.success) {
                setUsers(prevUsers => prevUsers.map(u => u._id === userId ? { ...u, status: response.data.status } : u));
                Alert.alert('Success', `User status updated to ${response.data.status}`);
            }
        } catch (error) {
            console.error('Toggle Status Error:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.error || 'Failed to update user status');
        }
    };

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
        if (activeTab === 'Dashboard') {
            fetchStats();
        }
        if (activeTab === 'Users') {
            fetchUsers();
        }
    }, [activeTab, fetchEvents, fetchStats, fetchUsers]);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.replace('Login');
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

    const resetForm = () => {
        setTitle('');
        setLocation('');
        setDescription('');
        setDate(new Date());
        setTime('18:00');
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
        if (event.time) setTime(event.time);
        setImage(event.image ? `${axiosInstance.defaults.baseURL.replace('/api', '')}${event.image}` : null);
        setTickets(event.tickets.map(({ type, price, quantity }) => ({ 
            type, 
            price: price.toString(), 
            quantity: quantity.toString() 
        })));
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!title || !location || !description || tickets.some(t => !t.type || !t.price || !t.quantity)) {
            Alert.alert('Error', 'Please fill all fields correctly');
            return;
        }

        setModalLoading(true);
        const formData = new FormData();
        
        // Handle manual date entry
        let finalDate = date;
        if (typeof date === 'string') {
            const parsed = new Date(date);
            if (isNaN(parsed.getTime())) {
                Alert.alert('Error', 'Please enter a valid date (YYYY-MM-DD)');
                setModalLoading(false);
                return;
            }
            finalDate = parsed;
        }

        // Validate date is tomorrow or later
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (finalDate < tomorrow) {
            Alert.alert('Error', 'Please select a date for tomorrow or later');
            setModalLoading(false);
            return;
        }

        formData.append('title', title);
        formData.append('date', finalDate.toISOString());
        formData.append('time', time);
        formData.append('location', location);
        formData.append('description', description);
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Hello,</Text>
                    <Text style={styles.adminName}>{user?.name || 'Admin'}</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#FFD301" />
                </TouchableOpacity>
            </View>

            {activeTab === 'Dashboard' && (
                <ScrollView style={styles.content}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{stats.activeEvents}</Text>
                            <Text style={styles.statLabel}>Active Events</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{stats.pastEvents}</Text>
                            <Text style={styles.statLabel}>Past Events</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{stats.totalBookings}</Text>
                            <Text style={styles.statLabel}>Total Bookings</Text>
                        </View>
                    </View>
                </ScrollView>
            )}

            {activeTab === 'Events' && (
                <View style={styles.content}>
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

                    <View style={styles.filterTabs}>
                        <TouchableOpacity 
                            style={[styles.filterTab, eventType === 'active' && styles.filterTabActive]}
                            onPress={() => setEventType('active')}
                        >
                            <Text style={[styles.filterTabText, eventType === 'active' && styles.filterTabTextActive]}>Active</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.filterTab, eventType === 'old' && styles.filterTabActive]}
                            onPress={() => setEventType('old')}
                        >
                            <Text style={[styles.filterTabText, eventType === 'old' && styles.filterTabTextActive]}>Past Events</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#FFD301" style={{ marginTop: 50 }} />
                    ) : (
                        <ScrollView style={styles.eventList} showsVerticalScrollIndicator={false}>
                            {events.map((event) => (
                                <EventCard 
                                    key={event._id}
                                    event={event}
                                    eventType={eventType}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                    onView={(e) => Alert.alert('View Only', 'Viewing past event: ' + e.title)}
                                />
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setIsModalOpen(true); }}>
                        <Ionicons name="add" size={32} color="#000" />
                    </TouchableOpacity>
                </View>
            )}

            {activeTab === 'Users' && (
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>User Management</Text>
                    {usersLoading ? (
                        <ActivityIndicator color="#FFD301" size="large" />
                    ) : (
                        <ScrollView style={styles.eventList} showsVerticalScrollIndicator={false}>
                            {users.map(user => (
                                <View key={user._id} style={styles.userCard}>
                                    <View style={styles.userInfo}>
                                        <View style={styles.userAvatar}>
                                            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.userName}>{user.name}</Text>
                                            <Text style={styles.userEmail}>{user.email}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.userStatusContainer}>
                                        <View style={[styles.statusDot, user.status === 'active' ? styles.dotActive : styles.dotInactive]} />
                                        <TouchableOpacity 
                                            style={[styles.statusBtn, user.status === 'active' ? styles.deactivateBtn : styles.activateBtn]}
                                            onPress={() => toggleUserStatus(user._id)}
                                        >
                                            <Text style={[styles.statusBtnText, user.status === 'active' ? styles.deactivateText : styles.activateText]}>
                                                {user.status === 'active' ? 'Deactive' : 'Active'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                            {users.length === 0 && (
                                <Text style={styles.placeholderText}>No registered users yet</Text>
                            )}
                        </ScrollView>
                    )}
                </View>
            )}

            {!['Dashboard', 'Events', 'Users'].includes(activeTab) && (
                <View style={styles.placeholderContent}>
                    <Ionicons name="construct-outline" size={60} color="#333" />
                    <Text style={styles.placeholderText}>{activeTab} Module Coming Soon</Text>
                </View>
            )}

            <EventModal 
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                loading={modalLoading}
                editingEvent={editingEvent}
                handleSubmit={handleSubmit}
                title={title} setTitle={setTitle}
                location={location} setLocation={setLocation}
                description={description} setDescription={setDescription}
                date={date} setDate={setDate}
                time={time} setTime={setTime}
                image={image} pickImage={pickImage}
                tickets={tickets}
                addTicketRow={() => setTickets([...tickets, { type: '', price: '', quantity: '' }])}
                removeTicketRow={(i) => setTickets(tickets.filter((_, idx) => idx !== i))}
                updateTicketRow={(i, f, v) => {
                    const t = [...tickets];
                    t[i][f] = v;
                    setTickets(t);
                }}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
            />

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, backgroundColor: '#000' },
    welcomeText: { color: '#888', fontSize: 14 },
    adminName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    logoutBtn: { padding: 10, backgroundColor: '#1A1A1A', borderRadius: 12 },
    content: { flex: 1, paddingHorizontal: 25 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    statsGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    statCard: { minWidth: '30%', flex: 1, backgroundColor: '#111', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
    statNumber: { color: '#FFD301', fontSize: 22, fontWeight: 'bold' },
    statLabel: { color: '#888', fontSize: 10, marginTop: 5, textAlign: 'center' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', paddingHorizontal: 15, borderRadius: 15, height: 50, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
    searchInput: { flex: 1, marginLeft: 10, color: '#FFF' },
    filterTabs: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    filterTab: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#111' },
    filterTabActive: { backgroundColor: '#FFD301' },
    filterTabText: { color: '#888', fontSize: 12, fontWeight: 'bold' },
    filterTabTextActive: { color: '#000' },
    eventList: { flex: 1, marginBottom: 90 },
    fab: { 
        position: 'absolute', 
        bottom: 100, 
        right: 0, 
        width: 60, 
        height: 60, 
        backgroundColor: '#FFD301', 
        borderRadius: 30, 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 5, 
        boxShadow: '0px 4px 8px rgba(255, 211, 1, 0.3)' 
    },
    placeholderContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    placeholderText: { color: '#444', fontSize: 16, marginTop: 15 },
    
    // User Management Styles
    userCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#111', 
        padding: 15, 
        borderRadius: 18, 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222'
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    userAvatar: { 
        width: 45, 
        height: 45, 
        borderRadius: 22.5, 
        backgroundColor: '#1A1A1A', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },
    avatarText: { color: '#FFD301', fontWeight: 'bold', fontSize: 18 },
    userName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    userEmail: { color: '#666', fontSize: 13 },
    statusBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12, minWidth: 90, alignItems: 'center' },
    deactivateBtn: { backgroundColor: 'rgba(244, 67, 54, 0.1)', borderWidth: 1, borderColor: '#F44336' },
    activateBtn: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderWidth: 1, borderColor: '#4CAF50' },
    statusBtnText: { fontWeight: 'bold', fontSize: 11 },
    deactivateText: { color: '#F44336' },
    activateText: { color: '#4CAF50' },
    userStatusContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    dotActive: { backgroundColor: '#4CAF50', boxShadow: '0 0 8px #4CAF50' },
    dotInactive: { backgroundColor: '#F44336', boxShadow: '0 0 8px #F44336' },
});

export default AdminPortal;
