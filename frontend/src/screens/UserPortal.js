import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const UserPortal = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('Events');

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
                size={24} 
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
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.name}>{user?.name.split(' ')[0] || 'User'}</Text>
                </View>

                {activeTab === 'Events' && (
                    <View style={styles.content}>
                        <View style={styles.card}>
                            <Ionicons name="sparkles" size={30} color="#FFD301" style={{marginBottom: 15}} />
                            <Text style={styles.cardTitle}>Your Experience Starts Here</Text>
                            <Text style={styles.cardSubtitle}>Explore the latest events and book your tickets with EventPass.</Text>
                            <TouchableOpacity style={styles.exploreBtn}>
                                <Text style={styles.exploreBtnText}>Explore Now</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Popular Events</Text>
                        <View style={[styles.card, { marginTop: 15, backgroundColor: '#0A0A0A' }]}>
                            <Text style={styles.cardSubtitle}>No upcoming events found. Check back later!</Text>
                        </View>
                    </View>
                )}

                {activeTab === 'My account' && (
                    <View style={styles.content}>
                        <View style={styles.profileCard}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={40} color="#000" />
                            </View>
                            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
                        </View>

                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="ticket-outline" size={22} color="#FFD301" />
                            <Text style={styles.menuText}>My Tickets</Text>
                            <Ionicons name="chevron-forward" size={18} color="#333" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="settings-outline" size={22} color="#FFD301" />
                            <Text style={styles.menuText}>Settings</Text>
                            <Ionicons name="chevron-forward" size={18} color="#333" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={22} color="#f44336" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
                <NavItem name="Events" icon="calendar-outline" />
                <NavItem name="My account" icon="person-outline" />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    scrollContent: { padding: 25, paddingBottom: 100 },
    header: { marginTop: 30, marginBottom: 40 },
    greeting: { fontSize: 20, color: '#A0A0A0' },
    name: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
    content: { flex: 1 },
    sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginTop: 30 },
    card: { 
        backgroundColor: '#1A1A1A', 
        padding: 25, 
        borderRadius: 24, 
        borderWidth: 1, 
        borderColor: '#333' 
    },
    cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFD301', marginBottom: 12 },
    cardSubtitle: { fontSize: 16, color: '#A0A0A0', lineHeight: 24 },
    exploreBtn: {
        backgroundColor: '#FFD301',
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    exploreBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    
    // Profile Styles
    profileCard: {
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        padding: 30,
        borderRadius: 24,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#333'
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFD301',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    profileName: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    profileEmail: { color: '#666', fontSize: 14, marginTop: 5 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        padding: 20,
        borderRadius: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    menuText: { flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 15 },
    logoutButton: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A1A1A', 
        height: 60, 
        borderRadius: 18, 
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#f4433633',
        gap: 10
    },
    logoutText: { color: '#f44336', fontSize: 16, fontWeight: 'bold' },

    // Bottom Nav Styles
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 85,
        backgroundColor: '#0A0A0A',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#222',
        paddingBottom: 20,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '50%'
    },
    navText: {
        fontSize: 12,
        marginTop: 6,
        fontWeight: '600'
    }
});

export default UserPortal;
