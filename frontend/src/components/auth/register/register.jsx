import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/authcontext';
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth';
import './register.css';

const Register = () => {
    const { userLoggedIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');


    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!isRegistering) {
            setIsRegistering(true);
            setError('');
            try {
                await doCreateUserWithEmailAndPassword(email, password);
                // No need to set redirect state; userLoggedIn will update and trigger redirect
            } catch (err) {
                setError(err.message);
                setIsRegistering(false);
            }
        }
    };

    return (
        <>
            {userLoggedIn && <Navigate to="/dashboard" replace />}
            <main className="register-page">
                <div className="register-container">
                    <div className="register-header">
                        <h3>Create a New Account</h3>
                    </div>
                    <form onSubmit={onSubmit} className="register-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isRegistering}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isRegistering}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                autoComplete="off"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isRegistering}
                            />
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        <button
                            type="submit"
                            disabled={isRegistering}
                            className={`submit-button ${isRegistering ? 'disabled' : ''}`}
                        >
                            {isRegistering ? 'Signing Up...' : 'Sign Up'}
                        </button>

                        <div className="form-footer">
                            Already have an account?{' '}
                            <Link to="/login" className="login-link">
                                Continue
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
};

export default Register;
