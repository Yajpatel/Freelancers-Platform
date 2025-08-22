// App.jsx
// import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './common/HomePage';
import Login from './components/auth/login/login'
import Register from './components/auth/register/register'
// import DashBoard from './pages/DashBoard'
import ProfilePage from './common/ProfilePage';
import SearchProjects from './freelancerPages/SearchProjects'
import Projectdetails from './freelancerPages/Projectdetails'
import Chat from './common/Chat';
import ClientDashboard from './clientPages/ClientDashboard';
import FreelancerDashboard from './freelancerPages/FreelancerDashboard'
import RoleProvider from './context/Rolecontext';
import Message from './common/Message';
import Proposalspage from './clientPages/Proposalspage';
import ClientProjectPage from './clientPages/ClientProjectPage';
import FreelancerProjectPage from './freelancerPages/FreelancerProjectPage';
import PostProjectPage from './clientPages/PostProjectPage';
import ClientTransactionPage from './clientPages/ClientTransactionPage';
import FreelancerTransactionsPage from './freelancerPages/FreelancerTransactionsPage';
import DetailedProjectPage from './common/DetailedProjectPage';
import FindFreelancers from './clientPages/FindFreelancers';
function App() {
  return (
    <>  
    <Router>
      <RoleProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/home" element={<HomePage />} /> optional if /home redirection is used */}
        {/* <Route path="/dashboard" element={<DashBoard />} /> */}
        <Route path='/client/dashboard' element={<ClientDashboard/>}></Route>
        <Route path='/freelancer/dashboard' element={<FreelancerDashboard/>}></Route>
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/project/SearchProjects" element={<SearchProjects />} />
        <Route path="/project/projectdetails/:id" element={<Projectdetails />} />
        
        <Route path="/chat/:id" element={<Chat/>}></Route>
        <Route path="/messages" element={<Message/>}></Route>
        <Route path="/myproposals" element={<Proposalspage/>}></Route>
        {/* <Route path="/my-projects" element={<MyProjectpage/>}></Route> */}
        <Route path="/client/myprojects" element={<ClientProjectPage/>}></Route>
        <Route path="/freelancer/myprojects" element={<FreelancerProjectPage/>}></Route>
        <Route path="/postproject" element={<PostProjectPage/>}></Route>
        <Route path="/freelancertransaction" element={<FreelancerTransactionsPage/>}></Route>
        <Route path="/clienttransactions" element={<ClientTransactionPage/>}></Route>
        <Route path="/details/:projectId" element={<DetailedProjectPage />}></Route>
        <Route path="/findfreelancers" element={<FindFreelancers />}></Route>
        
      </Routes>
      </RoleProvider>
    </Router>
    </>
  )
}
export default App;