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
    const [userSearch, setUserSearch] = useState('');
    const [eventType, setEventType] = useState('active'); // 'active' or 'old'
    const [loading, setLoading] = useState(false);
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [stats, setStats] = useState({ activeEvents: 0, pastEvents: 0, totalBookings: 0 });
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingSearch, setBookingSearch] = useState('');

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

    const fetchAllBookings = useCallback(async () => {
        setBookingsLoading(true);
        try {
            const response = await axiosInstance.get(`/bookings?search=${bookingSearch}`);
            setBookings(response.data);
        } catch (error) {
            console.error('Bookings fetch failed:', error);
        } finally {
            setBookingsLoading(false);
        }
    }, [bookingSearch]);

    const updateBookingStatus = async (bookingId, currentStatus) => {
        const nextStatus = currentStatus === 'confirmed' ? 'hand over' : 'confirmed';
        try {
            const response = await axiosInstance.put(`/bookings/${bookingId}/status`, { status: nextStatus });
            if (response.data.success) {
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: nextStatus } : b));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

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
        if (activeTab === 'Bookings') {
            fetchAllBookings();
        }
    }, [activeTab, fetchEvents, fetchStats, fetchUsers, fetchAllBookings]);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.replace('Login');
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
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

    const handleDelete = async (id) => {
        const performDelete = async () => {
            try {
                await axiosInstance.delete(`/events/${id}`);
                fetchEvents();
            } catch (error) {
                console.error('Delete error:', error.response?.data);
                Alert.alert('Error', error.response?.data?.error || 'Failed to delete');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this event?')) {
                performDelete();
            }
        } else {
            Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: performDelete }
            ]);
        }
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
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.dashboardHero}>
                        <Text style={styles.sectionTitle}>Dashboard Overview</Text>
                        <Text style={styles.dashboardSubtitle}>Track your event performance and user growth</Text>
                    </View>

                    {/* Featured Stat Card */}
                    <View style={styles.featuredCard}>
                        <View style={styles.featuredInfo}>
                            <Text style={styles.featuredLabel}>Total Bookings</Text>
                            <Text style={styles.featuredValue}>{stats.totalBookings}</Text>
                            <View style={styles.trendBadge}>
                                <Ionicons name="trending-up" size={14} color="#4CAF50" />
                                <Text style={styles.trendText}>+12% from last month</Text>
                            </View>
                        </View>
                        <View style={styles.featuredIconContainer}>
                            <Ionicons name="stats-chart" size={40} color="#FFD301" />
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.modernStatsGrid}>
                        <View style={[styles.modernStatCard, { borderColor: '#4CAF5033' }]}>
                            <View style={[styles.statIconCircle, { backgroundColor: '#4CAF5015' }]}>
                                <Ionicons name="calendar" size={20} color="#4CAF50" />
                            </View>
                            <Text style={styles.modernStatValue}>{stats.activeEvents}</Text>
                            <Text style={styles.modernStatLabel}>Active Events</Text>
                        </View>

                        <View style={[styles.modernStatCard, { borderColor: '#FF980033' }]}>
                            <View style={[styles.statIconCircle, { backgroundColor: '#FF980015' }]}>
                                <Ionicons name="time" size={20} color="#FF9800" />
                            </View>
                            <Text style={styles.modernStatValue}>{stats.pastEvents}</Text>
                            <Text style={styles.modernStatLabel}>Past Events</Text>
                        </View>

                        <View style={[styles.modernStatCard, { borderColor: '#2196F333' }]}>
                            <View style={[styles.statIconCircle, { backgroundColor: '#2196F315' }]}>
                                <Ionicons name="people" size={20} color="#2196F3" />
                            </View>
                            <Text style={styles.modernStatValue}>{stats.activeUsers || 0}</Text>
                            <Text style={styles.modernStatLabel}>Active Users</Text>
                        </View>

                        <View style={[styles.modernStatCard, { borderColor: '#F4433633' }]}>
                            <View style={[styles.statIconCircle, { backgroundColor: '#F4433615' }]}>
                                <Ionicons name="person-remove" size={20} color="#F44336" />
                            </View>
                            <Text style={styles.modernStatValue}>{stats.deactiveUsers || 0}</Text>
                            <Text style={styles.modernStatLabel}>Deactive Users</Text>
                        </View>
                    </View>

                    {/* Quick Actions or Recent section */}
                    <View style={styles.recentSection}>
                        <Text style={styles.subSectionTitle}>Recent Analytics</Text>
                        <View style={styles.activityCard}>
                            <Ionicons name="notifications-outline" size={24} color="#888" />
                            <Text style={styles.activityText}>System is running optimally. All services active.</Text>
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

            {activeTab === 'Bookings' && (
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Booking Management</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#666" />
                        <TextInput 
                            style={styles.searchInput} 
                            placeholder="Find by ID, Event or User Email..." 
                            placeholderTextColor="#666"
                            value={bookingSearch}
                            onChangeText={setBookingSearch}
                        />
                    </View>

                    {bookingsLoading ? (
                        <ActivityIndicator color="#FFD301" size="large" />
                    ) : (
                        <ScrollView style={styles.eventList} showsVerticalScrollIndicator={false}>
                            {bookings.map(booking => (
                                <View key={booking._id} style={styles.bookingManageCard}>
                                    <View style={styles.bookingManageHeader}>
                                        <View>
                                            <Text style={styles.bookingManageId}>{booking.bookingId}</Text>
                                            <Text style={styles.bookingManageUser}>{booking.user?.name} ({booking.user?.email})</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: booking.status === 'confirmed' ? '#4CAF5022' : '#FF980022' }]}>
                                            <Text style={[styles.statusText, { color: booking.status === 'confirmed' ? '#4CAF50' : '#FF9800' }]}>
                                                {booking.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.bookingManageEvent}>{booking.event?.title}</Text>
                                    
                                    <View style={styles.bookingManageFooter}>
                                        <Text style={styles.bookingManagePrice}>Rs. {booking.totalPrice}</Text>
                                        <TouchableOpacity 
                                            style={[styles.statusBtn, booking.status === 'confirmed' ? styles.activateBtn : styles.deactivateBtn]}
                                            onPress={() => updateBookingStatus(booking._id, booking.status)}
                                        >
                                            <Text style={[styles.statusBtnText, booking.status === 'confirmed' ? styles.activateText : styles.deactivateText]}>
                                                {booking.status === 'confirmed' ? 'Mark Hand Over' : 'Mark Confirmed'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            )}

            {activeTab === 'Users' && (
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>User Management</Text>
                    
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#666" />
                        <TextInput 
                            style={styles.searchInput} 
                            placeholder="Find by email or name..." 
                            placeholderTextColor="#666"
                            value={userSearch}
                            onChangeText={setUserSearch}
                        />
                    </View>

                    {usersLoading ? (
                        <ActivityIndicator color="#FFD301" size="large" />
                    ) : (
                        <ScrollView style={styles.eventList} showsVerticalScrollIndicator={false}>
                            {users
                                .filter(u => 
                                    u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
                                    u.name.toLowerCase().includes(userSearch.toLowerCase())
                                )
                                .map(user => (
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
                        </ScrollView>
                    )}
                </View>
            )}

            {!['Dashboard', 'Events', 'Users', 'Bookings'].includes(activeTab) && (
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
    
    // Modern Dashboard Styles
    dashboardHero: { marginBottom: 25 },
    dashboardSubtitle: { color: '#666', fontSize: 13, marginTop: 5 },
    featuredCard: { 
        backgroundColor: '#111', 
        borderRadius: 24, 
        padding: 25, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFD30122',
        marginBottom: 20,
        boxShadow: '0px 10px 20px rgba(255, 211, 1, 0.05)'
    },
    featuredInfo: { flex: 1 },
    featuredLabel: { color: '#888', fontSize: 14, fontWeight: '600' },
    featuredValue: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginVertical: 5 },
    trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    trendText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
    featuredIconContainer: { width: 70, height: 70, borderRadius: 20, backgroundColor: '#FFD30110', justifyContent: 'center', alignItems: 'center' },
    
    modernStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
    modernStatCard: { 
        width: '48%', 
        backgroundColor: '#111', 
        borderRadius: 20, 
        padding: 18, 
        borderWidth: 1,
        boxShadow: '0px 4px 10px rgba(0,0,0,0.3)'
    },
    statIconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    modernStatValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    modernStatLabel: { color: '#666', fontSize: 12, marginTop: 4, fontWeight: '500' },
    
    recentSection: { marginBottom: 100 },
    subSectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    activityCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 15, 
        backgroundColor: '#111', 
        padding: 18, 
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#222'
    },
    activityText: { color: '#888', fontSize: 13, flex: 1 },

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
    userStatusContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    dotActive: { backgroundColor: '#4CAF50', boxShadow: '0 0 8px #4CAF50' },
    dotInactive: { backgroundColor: '#F44336', boxShadow: '0 0 8px #F44336' },

    // Booking Manage Card Styles
    bookingManageCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
    bookingManageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    bookingManageId: { color: '#FFD301', fontSize: 16, fontWeight: 'bold' },
    bookingManageUser: { color: '#666', fontSize: 12, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    bookingManageEvent: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    bookingManageFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222', paddingTop: 15 },
    bookingManagePrice: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default AdminPortal;
