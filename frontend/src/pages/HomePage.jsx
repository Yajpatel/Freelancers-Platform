// HomePage.jsx
import './HomePage.css'
import { Link } from "react-router-dom"

function HomePage() {
  return (
    <div>
      <ul>
        <li><Link to="/register"><button>Get started</button></Link></li>
      </ul>
    </div>
  )
}

export default HomePage
