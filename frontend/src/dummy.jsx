// import React, { useState } from 'react';
//     import { Navigate, Link } from 'react-router-dom';
//     import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth';
//     import { useAuth } from '../../../context/authcontext';
//     import './login.css'; // Import external CSS 

//     const Login = () => {
//         const { userLoggedIn } = useAuth();

//         const [email, setEmail] = useState('');
//         const [password, setPassword] = useState('');
//         const [isSigningIn, setIsSigningIn] = useState(false);

//         const onSubmit = async (e) => {
//             e.preventDefault();
//             if (!isSigningIn) {
//                 setIsSigningIn(true);
//                 await doSignInWithEmailAndPassword(email, password);
//             }
//         };

//         const onGoogleSignIn = async (e) => {
//             e.preventDefault();
//             if (!isSigningIn) {
//                 setIsSigningIn(true);
//                 // doSignInWithGoogle().catch(() => setIsSigningIn(false));

//                 try {
//                     const backendStatus = await fetch("http://localhost:8000/health");
//                     if (!backendStatus.ok) throw new Error('Backend is down. Please try again later.');
//                     const userCredential = await doSignInWithGoogle();
//                     const user = userCredential.user;

//                     // 🔁 Send user data to backend to sync with MongoDB
//                     await fetch("http://localhost:8000/stockfolio/getUser", {
//                         method: "POST",
//                         headers: {
//                         "Content-Type": "application/json"
//                         },
//                         body: JSON.stringify({
//                         email: user.email,
//                         name: user.displayName,
//                         firebaseUID: user.uid
//                         })
//                     });
//                     } catch (err) {
//                     console.error("Google Sign-In failed:", err);
//                     setIsSigningIn(false);
//                     }
//                 }
//             }
        

//         return (
//             <div className="login-page">
//                 {userLoggedIn && <Navigate to="/dashboard" replace />}
//                 <main className="login-container">
//                     <div className="login-box">
//                         <div className="login-header">
//                             <h3>Welcome Back</h3>
//                         </div>
//                         <form onSubmit={onSubmit} className="login-form">
//                             <div className="form-group">
//                                 <label>Email</label>
//                                 <input
//                                     type="email"
//                                     required
//                                     autoComplete="email"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                 />
//                             </div>
//                             <div className="form-group">
//                                 <label>Password</label>
//                                 <input
//                                     type="password"
//                                     required
//                                     autoComplete="current-password"
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                 />
//                             </div>
//                             <button type="submit" disabled={isSigningIn} className="submit-button">
//                                 {isSigningIn ? 'Signing In...' : 'Sign In'}
//                             </button>
//                         </form>
//                         <p className="signup-link">
//                             Don&apos;t have an account? <Link to="/signup">Sign up</Link>
//                         </p>
//                         <div className="or-divider">
//                             <span></span>
//                             <p>OR</p>
//                             <span></span>
//                         </div>
//                         <button
//                             disabled={isSigningIn}
//                             onClick={onGoogleSignIn}
//                             className="google-button"
//                         >
//                             <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Icon" />
//                             {isSigningIn ? 'Signing In...' : 'Continue with Google'}
//                         </button>
//                     </div>
//                 </main>
//             </div>
//         );
//     };

//     export default Login;












    

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


// css ///////

/* --- Step 1: Global Styles & Font Import --- */
// @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');

// :root {
//   /* --- CUSTOMIZE YOUR IMAGES HERE --- */
//   --client-bg-image: url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1784');
//   --freelancer-bg-image: url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1740');
  
//   /* --- CUSTOMIZE YOUR COLORS HERE --- */
//   --accent-client: #0077ff;
//   --accent-freelancer: #00c49a;
//   --text-color: #ffffff;
//   --overlay-color: rgba(0, 0, 0, 0.4);
//   --overlay-hover-color: rgba(0, 0, 0, 0.2);
//   --overlay-inactive-color: rgba(0, 0, 0, 0.7);
// }

// /* --- Keyframe Animation for "Living" Backgrounds --- */
// @keyframes kenburns {
//   0% {
//     transform: scale(1) translate(0, 0);
//   }
//   100% {
//     transform: scale(1.15) translate(-2%, 2%);
//   }
// }

// /* --- Base Layout --- */
// body {
//   margin: 0;
//   font-family: 'Poppins', sans-serif;
// }

// .container {
//   display: flex;
//   width: 100vw;
//   height: 100vh;
//   overflow: hidden;
// }

// /* --- The Interactive Splits --- */
// .split {
//   flex: 1;
//   position: relative;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   overflow: hidden; /* Crucial for Ken Burns effect */
//   cursor: pointer;
//   transition: flex 0.8s cubic-bezier(0.25, 1, 0.5, 1);
// }

// .split::after { /* The background image is here */
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background-size: cover;
//   background-position: center;
//   /* Apply the living background animation */
//   animation: kenburns 20s ease-out infinite alternate;
//   z-index: 1;
// }

// .split::before { /* The color overlay is here */
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background-color: var(--overlay-color);
//   transition: background-color 0.5s ease;
//   z-index: 2;
// }

// .client-container::after {
//   background-image: var(--client-bg-image);
// }
// .freelancer-container::after {
//   background-image: var(--freelancer-bg-image);
// }

// /* --- Content Styling --- */
// .content-wrapper {
//   position: relative;
//   z-index: 3;
//   text-align: center;
//   color: var(--text-color);
//   padding: 2rem;
//   user-select: none;
// }

// h3 {
//   font-size: 3.5vw; /* Responsive font size */
//   font-weight: 800;
//   text-transform: uppercase;
//   margin: 0;
//   letter-spacing: 1px;
//   transition: transform 0.5s ease;
// }

// /* This is the highlighted word */
// h3 span {
//   display: block;
// }
// .client-container h3 span {
//   color: var(--accent-client);
// }
// .freelancer-container h3 span {
//   color: var(--accent-freelancer);
// }

// p {
//   font-size: 1.2rem;
//   font-weight: 400;
//   margin: 1.5rem 0;
//   max-width: 400px;
//   line-height: 1.6;
//   opacity: 0;
//   transform: translateY(20px);
//   transition: opacity 0.5s ease, transform 0.5s ease;
//   transition-delay: 0.1s;
// }

// /* Call to Action Button */
// .cta-button {
//   display: inline-block;
//   font-size: 1rem;
//   font-weight: 600;
//   padding: 12px 24px;
//   border: 2px solid var(--text-color);
//   border-radius: 50px;
//   margin-top: 1rem;
//   text-transform: uppercase;
//   letter-spacing: 1px;
//   opacity: 0;
//   transform: translateY(20px);
//   transition: all 0.5s ease;
//   transition-delay: 0.2s;
// }

// /* --- THE "WOW" HOVER INTERACTION --- */

// .container:hover .split:hover {
//   flex: 3; /* Grow significantly */
// }

// .container:hover .split:hover::before {
//   background-color: var(--overlay-hover-color);
// }
// .container:hover .split:not(:hover)::before {
//   background-color: var(--overlay-inactive-color);
// }

// .container:hover .split:hover p,
// .container:hover .split:hover .cta-button {
//   opacity: 1;
//   transform: translateY(0);
// }

// .container:hover .split:hover .cta-button:hover {
//   background-color: var(--text-color);
//   color: #111;
// }

// .container:hover .client-container:hover .cta-button:hover {
//   color: var(--accent-client);
// }
// .container:hover .freelancer-container:hover .cta-button:hover {
//   color: var(--accent-freelancer);
// }


// /* --- Step 7: Mobile Responsiveness --- */
// @media (max-width: 768px) {
//   .container {
//     flex-direction: column; /* Stack vertically on mobile */
//   }

//   h3 {
//     font-size: 10vw; /* Larger font for mobile impact */
//   }

//   p {
//     font-size: 1rem;
//   }
// }