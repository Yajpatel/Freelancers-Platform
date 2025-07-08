import React from 'react';
// import './FilterSidebar.css';

function FilterSidebar({ filters, setFilters }) {
  const techOptions = ['React', 'Node.js', 'MongoDB', 'Figma', 'Java', 'Python', 'HTML', 'CSS'];

  const handleTechChange = (e) => {
    const value = e.target.value;
    if (!filters.tech.includes(value)) {
      setFilters({...filters,tech :[...filters.tech,value]});
      // setFilters(prev => ({
      //   ...prev,
      //   tech: [...prev.tech, value]
      // }));
    }
  };

  const removeTech = (skill) => {
    setFilters({...filters,tech :[...filters.tech.filter(i => i!=skill)]});
    // setFilters(prev => ({
    //   ...prev,
    //   tech: prev.tech.filter(t => t !== skill)
    // }));
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setFilters({...filters,budget :{...filters,[name]:value}});
    // setFilters(prev => ({
    //   ...prev,
    //   budgetRange: { ...prev.budgetRange, [name]: value }
    // }));
  };
 
  return (
    <div className="filter-sidebar">
      <h3>Filter Projects</h3>

      <div className="filter-section">
        <label>Tech Stack</label>
        {/* <input type="text" name='tech' value={filters.tech} /> */}
        <select onChange={handleTechChange} defaultValue="">
          <option value="" disabled>Select tech</option>
          {techOptions.map((tech, idx) => (
            <option key={idx} value={tech}>{tech}</option>
          ))}
        </select>

        <div className="selected-techs">
          {filters.tech.map((skill, i) => (
            <span key={i} className="tech-chip">
              {skill}
              <button onClick={() => removeTech(skill)}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label>Budget (₹)</label>
        <div className="budget-inputs">
          <input
            type="number"
            name="min"
            placeholder="min"
            value={filters.budgetRange?.min || ''}
            onChange={handleBudgetChange}
          />
          <span>to</span>
          <input
            type="number"
            name="max"
            placeholder="max"
            value={filters.budgetRange?.max || ''}
            onChange={handleBudgetChange}
          />
        </div>
      </div>
    </div>
  );
}

export default FilterSidebar;
