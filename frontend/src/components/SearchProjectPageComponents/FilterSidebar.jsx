function FilterSidebar({ filters, setFilters }) {
  const handleTechChange = (tech) => {
    const updated = filters.tech.includes(tech)
      ? filters.tech.filter(t => t !== tech)
      : [...filters.tech, tech];
    setFilters(prev => ({ ...prev, tech: updated }));
  };

  return (
    <div className="filters">
      <h3>Budget</h3>
      <select value={filters.budget} onChange={(e) => setFilters(prev => ({ ...prev, budget: e.target.value }))}>
        <option value="">All</option>
        <option value="low">&lt; ₹5000</option>
        <option value="mid">₹5000 - ₹10000</option>
        <option value="high">&gt; ₹10000</option>
      </select>

      <h3>Tech Stack</h3>
      {['React', 'Node', 'Python', 'Java'].map(tech => (
        <label key={tech}>
          <input
            type="checkbox"
            checked={filters.tech.includes(tech)}
            onChange={() => handleTechChange(tech)}
          />
          {tech}
        </label>
      ))}
    </div>
  );
}

export default FilterSidebar;
