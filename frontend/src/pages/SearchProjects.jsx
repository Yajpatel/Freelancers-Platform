import {useState,useEffect} from 'react';
import axios from 'axios';
import Navbar from '../components/SearchProjectPageComponents/Navbar';
import ProjectCards from '../components/SearchProjectPageComponents/Projectcard';
import FilterSidebar from '../components/SearchProjectPageComponents/FilterSidebar';
import '../pages/SearchProjects.css';
function SearchProjects(){
    // takes all the data from backend which is open and client is null
    const [projects,setprojects] = useState([]); 
    // search projects keywords and matches and put to filteredprojects
    const [mainsearch,setmainsearch] = useState(); 
    // takes input from the sidebar as user wants and than filter projects according to that than push to filteredprojects
    const [sidebarfilter,setsidebarfilter] = useState({budget:'',tech : []}); 
    // main filter in which all the filtered projects are pushed and than displayed to user
    const [filteredprojects,setfilteredprojects] =  useState([]); 


    // fetch data from database and store to projects hook and 
    // // also initial without filter data will be same so also store same to filteredprojects
     useEffect(() => {
    axios.get('http://localhost:8000/project/SearchProjects') // Change to your backend
      .then(res => {
        setprojects(res.data); //initially same all project which are open
        //main setfilteredprojects of which we will make div card
        setfilteredprojects(res.data); //same initially
      })
      .catch(err => console.error("Error fetching projects:", err));
  }, []);
    

    // filter logic based on user choice
      // Filter logic
  useEffect(() => {
    let result = [...projects];

    if (mainsearch) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(mainsearch.toLowerCase())
      );
    }

    if (sidebarfilter.tech.length > 0) {
      result = result.filter(p =>
        p.skills?.some(skill => sidebarfilter.tech.includes(skill))
      );
    }

    if (sidebarfilter.budget) {
      result = result.filter(p => {
        if (sidebarfilter.budget === 'low') return p.budget < 5000;
        if (sidebarfilter.budget === 'mid') return p.budget >= 5000 && p.budget <= 10000;
        if (sidebarfilter.budget === 'high') return p.budget > 10000;
        return true;
      });
    }

    setfilteredprojects(result);
  }, [sidebarfilter, mainsearch, projects]);
    return <>
        {/* <h1>Search Page</h1> */}

        <div className="search-page">
          <Navbar setSearchTerm={setmainsearch} />
          <div className="main-section">
            <FilterSidebar filters={sidebarfilter} setFilters={setsidebarfilter} />
            <div className="project-list">
              {filteredprojects.length === 0 ? (
                <p>No projects found.</p>
              ) : (
                filteredprojects.map(project => (
                  <ProjectCards key={project._id} project={project} />
                ))
              )}
            </div>
          </div>
        </div>
    </>
}
export default SearchProjects;