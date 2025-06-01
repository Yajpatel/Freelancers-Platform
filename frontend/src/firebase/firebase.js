// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKwP4vl1XkHPyroEtvpVhv4l5h9tfOADY",
  authDomain: "freelancers-platform.firebaseapp.com",
  projectId: "freelancers-platform",
  storageBucket: "freelancers-platform.firebasestorage.app",
  messagingSenderId: "931346479997",
  appId: "1:931346479997:web:6abd66ebbb5864972bea14",
  measurementId: "G-P8YF9CYKPS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// ⬇️ ADD THIS to disable login persistence after browser is closed
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // optional: continue setup or just leave empty
  })
  .catch((error) => {
    console.error("Persistence setting error:", error);
  });
// const provider = new GoogleAuthProvider();
// const analytics = getAnalytics(app);

export {app,auth};