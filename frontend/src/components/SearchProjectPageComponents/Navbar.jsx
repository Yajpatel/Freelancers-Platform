function Navbar({ setSearchTerm }) {
  return <>
    <nav className="navbar">
      <h2>FreelanceFinder</h2>
      <input
        type="text"
        placeholder="Search projects..."
        onChange={(e) => setSearchTerm(e.target.value)}
        />
    </nav>
    </>
}

export default Navbar;
