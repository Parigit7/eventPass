import React, { useState } from 'react';
import { 
    StyleSheet, Text, View, TextInput, TouchableOpacity, 
    Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../api/axios';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/register', { 
                name: name.trim(), 
                email: email.trim().toLowerCase(), 
                password: password.trim() 
            });
            
            Alert.alert(
                'Success', 
                'Account created successfully! Please login.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            console.error('Register Error:', error);
            const errorMessage = error.response?.data?.error || 'Registration failed. Try a different email.';
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join us and start booking events</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#666"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#666"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Password (min 6 chars)"
                                placeholderTextColor="#666"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.registerBtn} 
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.registerBtnText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.loginPrompt}>
                            <Text style={{ color: '#888' }}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={{ color: '#FFD301', fontWeight: 'bold' }}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    scrollContent: { padding: 25, flexGrow: 1 },
    backButton: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    header: { marginVertical: 40 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#888' },
    form: { flex: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 15, paddingHorizontal: 15, height: 60, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: '#FFFFFF', fontSize: 16 },
    registerBtn: {
        backgroundColor: '#FFD301',
        height: 65,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
        boxShadow: '0px 10px 20px rgba(255, 211, 1, 0.2)',
        elevation: 5,
    },
    registerBtnText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
    loginPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
});

export default RegisterScreen;
