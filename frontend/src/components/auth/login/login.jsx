import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth';
import { useAuth } from '../../../context/authcontext';
import './Login.css'; // Import external CSS

const Login = () => {
    const { userLoggedIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            await doSignInWithEmailAndPassword(email, password);
        }
    };

    const onGoogleSignIn = (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            doSignInWithGoogle().catch(() => setIsSigningIn(false));
        }
    };

    return (
        <div className="login-page">
            {userLoggedIn && <Navigate to="/dashboard" replace />}
            <main className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <h3>Welcome Back</h3>
                    </div>
                    <form onSubmit={onSubmit} className="login-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={isSigningIn} className="submit-button">
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <p className="signup-link">
                        Don&apos;t have an account? <Link to="/register">Sign up</Link>
                    </p>
                    <div className="or-divider">
                        <span></span>
                        <p>OR</p>
                        <span></span>
                    </div>
                    <button
                        disabled={isSigningIn}
                        onClick={onGoogleSignIn}
                        className="google-button"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Icon" />
                        {isSigningIn ? 'Signing In...' : 'Continue with Google'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Login;
