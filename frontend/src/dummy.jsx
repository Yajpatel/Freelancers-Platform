import React, { useState } from 'react';
    import { Navigate, Link } from 'react-router-dom';
    import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth';
    import { useAuth } from '../../../context/authcontext';
    import './login.css'; // Import external CSS 

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

        const onGoogleSignIn = async (e) => {
            e.preventDefault();
            if (!isSigningIn) {
                setIsSigningIn(true);
                // doSignInWithGoogle().catch(() => setIsSigningIn(false));

                try {
                    const backendStatus = await fetch("http://localhost:8000/health");
                    if (!backendStatus.ok) throw new Error('Backend is down. Please try again later.');
                    const userCredential = await doSignInWithGoogle();
                    const user = userCredential.user;

                    // 🔁 Send user data to backend to sync with MongoDB
                    await fetch("http://localhost:8000/stockfolio/getUser", {
                        method: "POST",
                        headers: {
                        "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                        email: user.email,
                        name: user.displayName,
                        firebaseUID: user.uid
                        })
                    });
                    } catch (err) {
                    console.error("Google Sign-In failed:", err);
                    setIsSigningIn(false);
                    }
                }
            }
        

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
                            {isSigningIn ? 'Signing In...' : 'Continue with Google'}
                        </button>
                    </div>
                </main>
            </div>
        );
    };

    export default Login;












    

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// // import { useAuth } from '../context/authcontext'; 
// import { useAuth } from '../context/authcontext'; // ✅ You already have this
// import './RoleChoice.css';

// const RoleChoice = () => {
//   const [selectedRole, setSelectedRole] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const { currentUser } = useAuth();  // ✅ Get current user from Auth context
//   const userEmail = currentUser?.email;  // ✅ Get email safely
//   console.log("email",userEmail);

//   const handleGoClick = async () => {
//     if (!selectedRole) {
//       alert('Please select a role first.');
//       return;
//     }

//     if (!userEmail) {
//       alert('User not logged in. Please log in again.');
//       navigate('/login');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:8000/freelancer/users/updateRole', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           email: userEmail,           // ✅ Using email from Auth context
//           currentRole: selectedRole
//         })
//       });

//       if (response.ok) {
//         if (selectedRole === 'Client') {
//           navigate('/client/dashboard');
//         } else if (selectedRole === 'Freelancer') {
//           navigate('/freelancer/dashboard');
//         }
//       } else {
//         console.error('❌ Failed to update role');
//         alert('Failed to update role. Please try again.');
//       }
//     } catch (error) {
//       console.error('❌ Error:', error);
//       alert('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="role-choice-page">
//       <h2>Select Your Role</h2>

//       <div className="role-options">
//         <div
//           className={`role-card ${selectedRole === 'Client' ? 'selected' : ''}`}
//           onClick={() => setSelectedRole('Client')}
//         >
//           <h3>I am a Client</h3>
//           <p>I want to post projects</p>
//         </div>

//         <div
//           className={`role-card ${selectedRole === 'Freelancer' ? 'selected' : ''}`}
//           onClick={() => setSelectedRole('Freelancer')}
//         >
//           <h3>I am a Freelancer</h3>
//           <p>I am looking for work</p>
//         </div>
//       </div>

//       <button
//         className="go-button"
//         onClick={handleGoClick}
//         disabled={!selectedRole || loading}
//       >
//         {loading ? 'Loading...' : 'Go'}
//       </button>
//     </div>
//   );
// };

// export default RoleChoice;
