// frontend/src/components/SearchProjectPageComponents/Navbar.jsx

function Navbar({ setFilters }) {
  // Update the parent's searchTerm filter on input change
  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  return (
    <nav className="navbar">
      <h2>FreelanceFinder</h2>
      <input
        type="text"
        placeholder="Search projects by title..."
        onChange={handleSearch}
      />
    </nav>
  );
}

export default Navbar;