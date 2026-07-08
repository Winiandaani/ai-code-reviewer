'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setMessage('🎉 Registration successful! Redirecting...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ marginBottom: '10px' }}>Create Account</h2>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Join the Smart AI Code Reviewer</p>
                
                {error && <div style={styles.error}>{error}</div>}
                {message && <div style={styles.success}>{message}</div>}

                <form onSubmit={handleSignUp} style={styles.form}>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                        required 
                    />
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required 
                    />
                    <button type="submit" style={styles.button}>Register</button>
                </form>
                <p style={styles.footer}>Already have an account? <a href="/login" style={{ color: '#10b981' }}>Sign In</a></p>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '12px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '16px' },
    button: { padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: '#10b981', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    error: { backgroundColor: '#ef4444', color: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' },
    success: { backgroundColor: '#10b981', color: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' },
    footer: { marginTop: '20px', fontSize: '14px', color: '#94a3b8' }
};