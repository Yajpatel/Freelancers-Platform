// App.jsx
// import './App.css'
import HomePage from './common/HomePage';
import Login from './components/auth/login/login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './components/auth/register/register'
// import DashBoard from './pages/DashBoard'
import ProfilePage from './pages/ProfilePage'
import SearchProjects from './pages/SearchProjects'
import Projectdetails from './pages/Projectdetails'
import Chat from './pages/Chat'
import RoleChoice from './common/RoleChoice'
import ClientDashboard from './clientPages/ClientDashboard'
import FreelancerDashboard from './freelancerPages/FreelancerDashboard'
import RoleProvider from './context/Rolecontext';
// import
function App() {
  return (
    <>
    <Router>
      <RoleProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/Rolechoice' element={<RoleChoice/>}></Route>
        {/* <Route path="/home" element={<HomePage />} /> optional if /home redirection is used */}
        {/* <Route path="/dashboard" element={<DashBoard />} /> */}
        <Route path='/client/dashboard' element={<ClientDashboard/>}></Route>
        <Route path='/freelancer/dashboard' element={<FreelancerDashboard/>}></Route>
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/project/SearchProjects" element={<SearchProjects />} />
        <Route path="/projectdetails/:id" element={<Projectdetails />} />
        <Route path="/chat/:id" element={<Chat/>}></Route>
      </Routes>
      </RoleProvider>
    </Router>
    </>
  )
}
export default App;