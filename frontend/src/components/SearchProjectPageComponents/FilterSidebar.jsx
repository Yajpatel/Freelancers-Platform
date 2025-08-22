// frontend/src/components/SearchProjectPageComponents/FilterSidebar.jsx
import React, { useState } from 'react';

function FilterSidebar({ filters, setFilters }) {
  const techOptions = ['React', 'Node.js', 'MongoDB', 'Figma', 'Java', 'Python', 'HTML', 'CSS', 'JavaScript', 'Django', 'Vue.js', 'Angular', 'AWS', 'WordPress', 'PHP', 'Graphic Design', 'Illustration'];
  
  // State for the custom skill input field
  const [customSkill, setCustomSkill] = useState('');

  // Handle checkbox changes for predefined skills
  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    setFilters(prev => {
      const skills = checked
        ? [...prev.skills, value]
        : prev.skills.filter(skill => skill !== value);
      return { ...prev, skills };
    });
  };

  // Handle adding a custom skill when Enter is pressed
  const handleCustomSkillKeyDown = (e) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          const newSkill = customSkill.trim();
          // Add the skill if it's not empty and not already in the list
          if (newSkill && !filters.skills.find(s => s.toLowerCase() === newSkill.toLowerCase())) {
              setFilters(prev => ({
                  ...prev,
                  skills: [...prev.skills, newSkill]
              }));
          }
          // Clear the input field
          setCustomSkill('');
      }
  };
  
  // Handle budget input changes
  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      budget: { ...prev.budget, [name]: value }
    }));
  };

  // Handle removing any skill (from checkbox or custom)
  const removeSkill = (skillToRemove) => {
    setFilters(prev => ({
        ...prev,
        skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
 
  return (
    <aside className="filter-sidebar">
      <h3>Filters</h3>
      <div className="filter-section">
        <label>Fixed price</label>
        <div className="budget-inputs">
          <input
            type="number"
            name="min"
            placeholder="Min"
            value={filters.budget.min}
            onChange={handleBudgetChange}
            min="0"
          />
          <span>to</span>
          <input
            type="number"
            name="max"
            placeholder="Max"
            value={filters.budget.max}
            onChange={handleBudgetChange}
            min="0"
          />
        </div>
      </div>

      <div className="filter-section">
        <label>Skills</label>
        {/* Input for custom skills */}
        <input
            type="text"
            placeholder="Add a skill and press Enter"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={handleCustomSkillKeyDown}
            className="custom-skill-input"
        />
        {/* Display selected skills as tags */}
        <div className="selected-skills-tags">
            {filters.skills.map((skill) => (
                <span key={skill} className="skill-tag-item">
                    {skill}
                    <button onClick={() => removeSkill(skill)}>&times;</button>
                </span>
            ))}
        </div>
        {/* Predefined skill checkboxes */}
        <div className="skill-checkbox-list">
          {techOptions.sort().map((tech) => (
            <div key={tech} className="skill-item">
              <input
                type="checkbox"
                id={`skill-${tech}`}
                value={tech}
                checked={filters.skills.includes(tech)}
                onChange={handleSkillChange}
              />
              <label htmlFor={`skill-${tech}`}>{tech}</label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
