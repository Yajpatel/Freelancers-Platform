import React, { useState,useContext  } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth';
// import { useAuth } from '../../../context/authcontext';
import './login.css';
import { RoleContext } from '../../../context/Rolecontext';


const Login = () => {
  // const { userLoggedIn } = useAuth();
  const { role } = useContext(RoleContext); // 'Client' or 'Freelancer'
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  // update role method called if user selected any different role than previous one
   const updateRoleIfNeeded = async (firebaseUID, selectedRole, userFromDB) => {
    // const roleExists = userFromDB.roles.includes(selectedRole);

    if (userFromDB.currentRole !== selectedRole) {
      await axios.put(`http://localhost:8000/freelancer/users/updaterole/${firebaseUID}`, {
        selectedRole
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      setError('');
      try {
            try {
            await axios.get("http://localhost:8000/health");
            console.log("Backend connected");
            } catch (err) {
            console.error("Backend is down:", err.message);
            }


        const userCredential = await doSignInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Fetch user data from backend (GET)
        const response = await axios.get(`http://localhost:8000/freelancer/users/getuser/${user.uid}`);
        console.log("Fetched User from DB:", response.data);
        // const userFromDB = response.data;


        // check that if user has selected any other role??
        await updateRoleIfNeeded(user.uid, role, response.data);
        
        if (role === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/freelancer/dashboard');
        }

      } catch (err) {
        console.error("Login error:", err);
        setError(err.response?.data?.message || 'Login failed.');
        setIsSigningIn(false);
      }
    }
  };


const onGoogleSignIn = async (e) => {
  e.preventDefault();
  if (!isSigningIn) {
    setIsSigningIn(true);
    setError('');

    try {
      const backendStatus = await fetch("http://localhost:8000/health");
      if (!backendStatus.ok) throw new Error('Backend is down. Please try again later.');

      // Firebase login
      const userCredential = await doSignInWithGoogle();
      const user = userCredential.user;

      // Sync user to backend
      await fetch("http://localhost:8000/freelancer/users/saveUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          firebaseUID: user.uid,
          role, // Add this so that correct role is saved (from RoleContext)
        })
      });

      // Fetch user from DB (after syncing)
      const res = await fetch(`http://localhost:8000/freelancer/users/getuser/${user.uid}`);
      const userData = await res.json();

      // Update role if needed
      await updateRoleIfNeeded(user.uid, role, userData);

      // Redirect based on role
      if (role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }

    } catch (err) {
      console.error("Google Sign-In failed:", err);
      setError(err.message || 'Google Sign-In failed.');
      setIsSigningIn(false);
    }
  }
};

  return (
    <div className="login-page">
      {/* {userLoggedIn && <Navigate to="/dashboard" replace />} */}
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
                disabled={isSigningIn}
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
                disabled={isSigningIn}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" disabled={isSigningIn} className="submit-button">
              {isSigningIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className="signup-link">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
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
            {isSigningIn ? 'Signing In...' : 'Sign-in with google'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
