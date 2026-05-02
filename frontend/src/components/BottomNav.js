import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNav = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { name: 'Dashboard', icon: 'grid' },
        { name: 'Events', icon: 'calendar' },
        { name: 'Bookings', icon: 'ticket' },
        { name: 'Users', icon: 'people' },
    ];

    return (
        <View style={styles.bottomNav}>
            {navItems.map((item) => (
                <TouchableOpacity 
                    key={item.name} 
                    style={styles.navItem} 
                    onPress={() => setActiveTab(item.name)}
                >
                    <Ionicons 
                        name={activeTab === item.name ? item.icon : `${item.icon}-outline`} 
                        size={22} 
                        color={activeTab === item.name ? '#FFD301' : '#888'} 
                    />
                    <Text style={[
                        styles.navText, 
                        { color: activeTab === item.name ? '#FFD301' : '#888' }
                    ]}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
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
        paddingBottom: 15 
    },
    navItem: { alignItems: 'center', gap: 4 },
    navText: { fontSize: 10, fontWeight: '600' },
});

export default BottomNav;
