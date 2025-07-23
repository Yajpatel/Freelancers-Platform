import React from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { RoleContext } from '../context/Rolecontext';

const HomePage = () => {
  const { setRole } = useContext(RoleContext);
  const navigate = useNavigate();

  const selectedclient = () => {
    setRole('client');
    navigate('/register');
  };
  const selectedfreelancer = () => {
    setRole('freelancer');
    navigate('/register');
  };

  return (
    <>
      <div className='container'>
        <div className="split client-container" onClick={selectedclient}>
          <div className="content-wrapper">
            <h3>
              I'm a <span>Client</span>
            </h3>
            <p>Looking to hire professionals for a project.</p>
            <div className="cta-button">Post Work&rarr;</div>
          </div>
        </div>
        <div className="split freelancer-container" onClick={selectedfreelancer}>
          <div className="content-wrapper">
            <h3>
              I'm a <span>Freelancer</span>
            </h3>
            <p>Searching for my next creative opportunity.</p>
            <div className="cta-button">Find Work &rarr;</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;



// import React from 'react';
// import './HomePage.css';
// import { useNavigate } from 'react-router-dom';
// import { useRole } from '../context/RoleContext';

// const HomePage = () => {
//   const navigate = useNavigate();
//   const { setRole } = useRole();

//   const selectedclient = () => {
//     setRole('Client');
//     navigate('/register');
//   };

//   const selectedfreelancer = () => {
//     setRole('Freelancer');
//     navigate('/register');
//   };

//   return (
//     <div className="home-container">
//       <h1 className="home-title">Get Started</h1>
//       <div className="role-card-container">
//         <div className="role-card client" onClick={selectedclient}>
//           <h3>I am a Client</h3>
//           <p>I want to post projects</p>
//         </div>
//         <div className="role-card freelancer" onClick={selectedfreelancer}>
//           <h3>I am a Freelancer</h3>
//           <p>I want to find work</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;
