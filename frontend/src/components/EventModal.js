import { 
    StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
    ScrollView, TextInput, Image, Modal, ActivityIndicator, Platform,
    KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const EventModal = ({ 
    visible, onClose, loading, editingEvent, handleSubmit,
    title, setTitle, location, setLocation, description, setDescription,
    date, setDate, time, setTime, image, pickImage, tickets,
    addTicketRow, removeTicketRow, updateTicketRow, showDatePicker, setShowDatePicker
}) => {
    return (
        <Modal visible={visible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{editingEvent ? 'Edit Event' : 'New Event'}</Text>
                        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFD301" /> : <Text style={styles.saveBtn}>Save</Text>}
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={styles.modalForm} 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    >
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
                        <TextInput 
                            style={styles.modalInput} 
                            value={title} 
                            onChangeText={setTitle} 
                            placeholder="Concert, Festival, etc." 
                            placeholderTextColor="#444" 
                        />

                        <View style={styles.dateTimeRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalLabel}>Date</Text>
                                {Platform.OS === 'web' ? (
                                    <View style={styles.manualInputContainer}>
                                        <TextInput 
                                            style={[styles.modalInput, { flex: 1, marginBottom: 0 }]} 
                                            value={date instanceof Date ? date.toISOString().split('T')[0] : date} 
                                            onChangeText={(v) => {
                                                const newDate = new Date(v);
                                                if (!isNaN(newDate)) setDate(newDate);
                                                else setDate(v);
                                            }}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="#444"
                                        />
                                        <TouchableOpacity 
                                            style={styles.pickerIconBtn} 
                                            onPress={() => {
                                                const tomorrow = new Date();
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                const minDate = tomorrow.toISOString().split('T')[0];

                                                const input = document.createElement('input');
                                                input.type = 'date';
                                                input.min = minDate;
                                                input.onchange = (e) => setDate(new Date(e.target.value));
                                                input.showPicker();
                                            }}
                                        >
                                            <Ionicons name="calendar-outline" size={20} color="#FFD301" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <>
                                        <TouchableOpacity style={styles.modalInput} onPress={() => setShowDatePicker(true)}>
                                            <Text style={{ color: '#FFF' }}>{date instanceof Date ? date.toLocaleDateString() : date}</Text>
                                        </TouchableOpacity>
                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={date instanceof Date ? date : new Date()}
                                                mode="date"
                                                onChange={(e, selectedDate) => {
                                                    setShowDatePicker(false);
                                                    if (selectedDate) setDate(selectedDate);
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalLabel}>Time</Text>
                                {Platform.OS === 'web' ? (
                                    <input 
                                        type="time" 
                                        value={time} 
                                        onChange={(e) => setTime(e.target.value)}
                                        style={styles.webDateInput}
                                    />
                                ) : (
                                    <TextInput 
                                        style={styles.modalInput} 
                                        value={time} 
                                        onChangeText={setTime} 
                                        placeholder="18:00" 
                                        placeholderTextColor="#444" 
                                    />
                                )}
                            </View>
                        </View>

                        <Text style={styles.modalLabel}>Location</Text>
                        <TextInput 
                            style={styles.modalInput} 
                            value={location} 
                            onChangeText={setLocation} 
                            placeholder="City Hall, Stadium, etc." 
                            placeholderTextColor="#444" 
                        />

                        <Text style={styles.modalLabel}>Description</Text>
                        <TextInput 
                            style={[styles.modalInput, { height: 100 }]} 
                            value={description} 
                            onChangeText={setDescription} 
                            multiline 
                            numberOfLines={4} 
                            placeholder="Describe your event..." 
                            placeholderTextColor="#444" 
                        />

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
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1, backgroundColor: '#000' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
    modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    saveBtn: { color: '#FFD301', fontSize: 16, fontWeight: 'bold' },
    modalForm: { flex: 1, padding: 20 },
    imagePicker: { width: '100%', height: 200, backgroundColor: '#1A1A1A', borderRadius: 15, overflow: 'hidden', marginBottom: 25, justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center' },
    imagePlaceholderText: { color: '#666', marginTop: 10, fontSize: 14 },
    modalLabel: { color: '#888', fontSize: 14, marginBottom: 8, fontWeight: '600' },
    modalInput: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 15, color: '#FFF', marginBottom: 20, borderWidth: 1, borderColor: '#333', justifyContent: 'center' },
    webDateInput: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 15,
        color: '#FFF',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
        width: '100%',
        fontSize: 14,
    },
    dateTimeRow: { flexDirection: 'row', gap: 15 },
    manualInputContainer: { flexDirection: 'row', alignItems: 'center', position: 'relative', marginBottom: 20 },
    pickerIconBtn: { position: 'absolute', right: 15, padding: 5 },
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
});

export default EventModal;
