import { useState } from 'react';
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { router } from 'expo-router';
import { login } from '@/features/auth/services/auth.service';
import { connectSocket } from '@/services/socket';

export default function LoginScreen() {
    const [phone, setPhone] = useState('998901234567');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setError('');

        if (phone.trim().length < 9 || password.length < 6) {
            setError("Telefon yoki parol noto'g'ri kiritilgan");
            return;
        }

        try {
            setIsLoading(true);
            const res = await login(phone.trim(), password);
            await connectSocket();
            console.log(res);
            router.replace('/home');
        } catch (e) {
            console.log('LOGIN ERROR:', e);
            setError('Login amalga oshmadi. Telefon va parolni tekshiring.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Telefon"
                style={styles.input}
                autoCapitalize="none"
            />

            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Parol"
                style={styles.input}
                secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {isLoading ? (
                <ActivityIndicator />
            ) : (
                <Button title="Kirish" onPress={handleLogin} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    error: {
        color: '#b00020',
        textAlign: 'center',
    },
});
