// App.jsx
// import './App.css'
import HomePage from './pages/HomePage'
import Login from './components/auth/login/login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './components/auth/register/register'
import DashBoard from './pages/DashBoard'
import ProfilePage from './pages/ProfilePage'
import SearchProjects from './pages/SearchProjects'
import Projectdetails from './pages/Projectdetails'
import Chat from './pages/Chat'

// import
function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} /> {/* optional if /home redirection is used */}
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/project/SearchProjects" element={<SearchProjects />} />
        <Route path="/projectdetails/:id" element={<Projectdetails />} />
        <Route path="/chat/:id" element={<Chat/>}></Route>
      </Routes>
    </Router>
    </>
  )
}
export default App;