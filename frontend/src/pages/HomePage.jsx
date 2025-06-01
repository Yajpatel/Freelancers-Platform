// HomePage.jsx
import './HomePage.css'
import { Link } from "react-router-dom"

function HomePage() {
  return (
    <div>
      <ul>
        <li><Link to="/register"><button>Post Work</button></Link></li>
        <li><Link to="/register"><button>Browse Work</button></Link></li>
      </ul>
    </div>
  )
}

export default HomePage
