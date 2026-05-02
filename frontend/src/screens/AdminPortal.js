import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const AdminPortal = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('Dashboard');

    useEffect(() => {
        const getUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        navigation.replace('Landing');
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
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>ADMIN PANEL</Text>
                    </View>
                    <Text style={styles.name}>Welcome, {user?.name.split(' ')[0] || 'Admin'}</Text>
                </View>

                {activeTab === 'Dashboard' && (
                    <>
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
                            <TouchableOpacity style={styles.actionButton}>
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
                            <TouchableOpacity style={styles.actionButton}>
                                <View style={styles.actionContent}>
                                    <Ionicons name="people-outline" size={24} color="#FFD301" />
                                    <Text style={styles.actionButtonText}>User Management</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutText}>System Logout</Text>
                        </TouchableOpacity>
                    </>
                )}

                {activeTab !== 'Dashboard' && (
                    <View style={styles.placeholderContent}>
                        <Ionicons name="construct-outline" size={60} color="#333" />
                        <Text style={styles.placeholderText}>{activeTab} Module Coming Soon</Text>
                    </View>
                )}
            </ScrollView>

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
    badge: { 
        backgroundColor: '#FFD301', 
        alignSelf: 'flex-start', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 5,
        marginBottom: 10
    },
    badgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
    name: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
    statsContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    statBox: { 
        flex: 1, 
        backgroundColor: '#1A1A1A', 
        padding: 20, 
        borderRadius: 15, 
        borderWidth: 1, 
        borderColor: '#333',
        alignItems: 'center'
    },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFD301', marginBottom: 5 },
    statLabel: { fontSize: 14, color: '#A0A0A0' },
    actionContainer: { gap: 15, marginBottom: 40 },
    actionButton: { 
        backgroundColor: '#1A1A1A', 
        height: 70, 
        borderRadius: 15, 
        justifyContent: 'center', 
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    actionContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    logoutButton: { 
        backgroundColor: '#1A1A1A', 
        height: 60, 
        borderRadius: 15, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f4433633'
    },
    logoutText: { color: '#f44336', fontSize: 16, fontWeight: 'bold' },
    
    // Bottom Nav Styles
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#0A0A0A',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#222',
        paddingBottom: 15,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontSize: 11,
        marginTop: 5,
        fontWeight: '500'
    },
    placeholderContent: {
        flex: 1,
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#666',
        fontSize: 16,
        marginTop: 20,
        fontWeight: '500'
    }
});

export default AdminPortal;
