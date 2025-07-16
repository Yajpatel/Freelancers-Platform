import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../../../context/authcontext';
import { doCreateUserWithEmailAndPassword ,doSignInWithGoogle} from '../../../firebase/auth';
import './register.css';
// import { auth } from "../../../firebase/firebase";
import axios from 'axios';
import { RoleContext } from '../../../context/Rolecontext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const { role } = useContext(RoleContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!name.trim()) return setError('Please enter your name');

    if (!isRegistering) {
      setIsRegistering(true);
      setError('');

      try {
        // Check backend availability
        try {
            await axios.get("http://localhost:8000/health");
            console.log("Backend connected");
            } catch (err) {
            console.error("Backend is down:", err.message);
            }

        // Firebase authentication
        const userCredential = await doCreateUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save user to backend
        const response = await axios.post("http://localhost:8000/freelancer/users/saveUser", {
          email: user.email,
          name,
          firebaseUID: user.uid,
          role
        });

        
        if (response.status === 200 || response.status === 201) {
          console.log("User saved:", response.data);
          if (role === 'client') {
            navigate('/client/dashboard');
          } else {
            navigate('/freelancer/dashboard');
        }
        } else {
          setError('Something went wrong while saving user.');
        }

      } catch (err) {
        console.error("Registration error:", err);
        setError(err.response?.data?.message || err.message || "Registration failed.");
        setIsRegistering(false);
      }
    }
  };

  const onGoogleSignIn = async (e) => {
  e.preventDefault();
  if (!isRegistering) {
    setIsRegistering(true);
    setError('');

    try {
      const backendStatus = await fetch("http://localhost:8000/health");
      if (!backendStatus.ok) throw new Error('Backend is down. Please try again later.');

      // Firebase Google Sign-In
      const userCredential = await doSignInWithGoogle();
      const user = userCredential.user;

      // Sync user to backend
      const res = await fetch("http://localhost:8000/freelancer/users/saveUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          firebaseUID: user.uid,
          role
        })
      });

      const result = await res.json();
      if (res.status !== 200 && res.status !== 201) throw new Error(result.message || "Failed to save user");

      // Navigate to appropriate dashboard
      if (role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }

    } catch (err) {
      console.error("Google Sign-Up failed:", err);
      setError(err.message || "Google Sign-Up failed.");
      setIsRegistering(false);
    }
  }
};

  return (
    <main className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h3>Create a New Account</h3>
        </div>

        <form onSubmit={onSubmit} className="register-form">
          <div className="form-group">
            <label>User Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isRegistering}
            />
          </div>

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

  {/* google sign - up button */}
            <button
                disabled={isRegistering}
                onClick={onGoogleSignIn}
                className="google-button"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Icon" />
                {isRegistering ? 'Signing Up...' : 'Sign-up with google'}
              </button>
          
        </form>
      </div>
    </main>
  );
};

export default Register;