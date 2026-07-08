'use client';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // ✅ This forces Next.js to wait until the page is fully mounted in the browser
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  // Use the built-in Supabase tool
  const supabase = createClient(); 
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
  } else {
    // Now the dashboard will "see" that you are logged in!
    router.push('/'); 
  }
};

    // If not mounted yet, render a clean loading background to prevent layout mismatch
    if (!mounted) {
        return <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}></div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ marginBottom: '10px' }}>Sign In</h2>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Access the Smart AI Code Reviewer</p>
                
                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} style={styles.form}>
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
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                {/* ✅ Cleaned up paragraph footer layout */}
                <div style={styles.footer}>
                    Don't have an account? <a href="/signup" style={{ color: '#3b82f6' }}>Sign Up</a>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '12px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '16px' },
    button: { padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    error: { backgroundColor: '#ef4444', color: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' },
    footer: { marginTop: '20px', fontSize: '14px', color: '#94a3b8' }
};