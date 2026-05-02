import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Background Glows */}
            <View style={[styles.glow, { top: -100, right: -100, backgroundColor: '#FFD30133' }]} />
            <View style={[styles.glow, { bottom: -150, left: -150, backgroundColor: '#FFD3011A' }]} />

            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="flash" size={30} color="#000" />
                    </View>
                    <Text style={styles.logoText}>Event<Text style={{color: '#FFD301'}}>Pass</Text></Text>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Discover {"\n"}Exclusive Events</Text>
                    <Text style={styles.heroSubtitle}>Your premium gateway to the most exciting concerts, festivals, and workshops in the city.</Text>
                </View>

                {/* Features Section */}
                <View style={styles.features}>
                    <View style={styles.featureItem}>
                        <Ionicons name="ticket-outline" size={24} color="#FFD301" />
                        <Text style={styles.featureText}>Instant Tickets</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="shield-checkmark-outline" size={24} color="#FFD301" />
                        <Text style={styles.featureText}>Secure Entry</Text>
                    </View>
                </View>

                {/* Buttons Section */}
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.loginButton} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Log In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.registerButton} 
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerButtonText}>Create New Account</Text>
                        <Ionicons name="chevron-forward" size={18} color="#FFD301" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        filter: 'blur(80px)', // Web only, for mobile we use opacity
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        backgroundColor: '#FFD301',
        padding: 8,
        borderRadius: 12,
        marginRight: 12,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    heroSection: {
        marginTop: 60,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 48,
        fontWeight: 'bold',
        lineHeight: 56,
        letterSpacing: -1,
    },
    heroSubtitle: {
        color: '#A0A0A0',
        fontSize: 18,
        lineHeight: 28,
        marginTop: 20,
        maxWidth: '90%',
    },
    features: {
        flexDirection: 'row',
        marginTop: 40,
        gap: 30,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        marginTop: 'auto',
    },
    loginButton: {
        backgroundColor: '#FFD301',
        height: 65,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#FFD301',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    loginButtonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    registerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
        gap: 8,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default LandingScreen;
