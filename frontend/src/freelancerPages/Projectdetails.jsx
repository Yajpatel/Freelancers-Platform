    import { useParams,Link } from 'react-router-dom';
    import { useEffect, useState } from 'react';
    import axios from 'axios';
    import { useAuth } from '../context/authcontext';
    // bootstrap import because i just want it for this file
    // import 'bootstrap/dist/css/bootstrap.min.css';

    import './Projectdetails.css'
    function Projectdetails() {
        const { id } = useParams();  // This is the project ID from the URL
        const { currentUser } = useAuth();
        const [project, setProject] = useState(null);
        const [client, setClient] = useState(null);
        const [isPanel, setisPanel] = useState(false);

        const [proposaldata, setproposaldata] = useState({description: '',bidamount: '',time: '',projectId: id,freelancerid : currentUser.uid})

        useEffect(() => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
            document.head.appendChild(link);

            return () => {
            document.head.removeChild(link); // Remove when component unmounts
            };
        }, []);

        useEffect(() => {
            const fetchProjectDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/project/projectdetails/${id}`);
                setProject(res.data.project);
                setClient(res.data.client);  // This assumes you send both project & client in response
            } catch (error) {
                console.error('Failed to fetch project details:', error);
            }
            };

            fetchProjectDetails();
        }, [id]);

            // for opening sideponel for proposal page
            const openpanel = () => { 
                setisPanel(true);
            }

        // for closing sidepanel of the proposal page
        const closepanel = (e) => { 
            e.preventDefault();
            setisPanel(false);
        }
        
        const handleSubmit = async (e) => { 
            e.preventDefault();
            try {
                const result = await axios.post('http://localhost:8000/project/saveproposal', {
                    freelancer: proposaldata.freelancerid,
                    project: proposaldata.projectId,
                    coverLetter: proposaldata.description,
                    biddingAmount: proposaldata.bidamount,
                    deliveryTime: proposaldata.time
                });

                if (result.status === 201) {
                    setisPanel(false);

                    setproposaldata({
                    description: '',
                    bidamount: '',
                    time: '',
                });
                
                    alert('your proposal submitted succesfully');
                }

                
                    
            } catch (error) {
                console.log('error while submitting');
            }
        }

        if (!project) return <p>Loading...</p>;

        return (
            <div className="project-details-page" style={{ display: 'flex', gap: '20px' }}>
            {/* Left: Project Info */}
            <div className="project-info" style={{ flex: 2, border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                <h2>{project.title}</h2>
                <p>{project.description}</p>
                <p><strong>Category:</strong> {project.category}</p>
                <p><strong>Budget:</strong> ₹{project.budget}</p>
                <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {project.status}</p>


                {/* this type of line is like if else if showProposalForm is true than show what is inside div or else if it is false than do not show */}
                {/* {showProposalForm && <div>Proposal form here</div>} */}
                <button onClick={openpanel} className='apply-btn'>Apply Proposal</button>
                
            </div>
            
            {/* Right: Client Info */}
            <div className="client-info" style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                <h3>Client Details</h3>
                {client ? (
                <>
                    <p><strong>client id:</strong> {client._id}</p>
                    <p><strong>Name:</strong> {client.name}</p>
                    <p><strong>Email:</strong> {client.email}</p>
                    <p><strong>Verified:</strong> {client.firebaseUID ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Rating:</strong> ⭐ {client.rating}</p>
                    <Link to={`/chat/${client._id}`}><button style={{ marginTop: '10px' }}>💬 Chat with Client</button></Link>
                    
                </>
                ) : (
                <p>Loading client details...</p>
                )}
            </div>

            {/* the proposal form */}
            
            <div className={`proposal-overlay ${isPanel ? 'is-visible' : ''}`}>
                <div className='container-lg'>
                        {/* <h1>Proposal page</h1> */}
                            <button type='button' className='close-panel' onClick={closepanel}><i className="fa-solid fa-arrow-right"></i></button>

                        <form onSubmit={handleSubmit}>
                        
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">short description</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="enter short message according to you" 
                                    id="description" 
                                    name="description"
                                    value={proposaldata.description}
                                    onChange={(e) => setproposaldata({ ...proposaldata, description: e.target.value })}

                                />
                            </div>
                            
                            <div className="mb-3">
                                <label htmlFor="bid" className="form-label">Bidding amount</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="enter your bidding amount" 
                                    id="bid" 
                                    name="bid"
                                    value={proposaldata.bidamount}
                                    onChange={(e) => setproposaldata({ ...proposaldata, bidamount: e.target.value })}

                                />
                            </div>
                            
                            <div className="mb-3">
                                <label htmlFor="time" className="form-label">Time of delivery</label>
                                <i className="fa-solid fa-clock-rotate-left me-2"></i>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="enter the amount of time you will take to finish this" 
                                    id='time'
                                    name="time"
                                    value={proposaldata.time}
                                    onChange={(e) => setproposaldata({ ...proposaldata, time: e.target.value })}

                                />
                            </div>
                            
                            <button type="submit" className="btn btn-primary submit-proposal" >
                                submit
                            </button>
                        </form>

                    </div>
                </div>

            {/*  */}
            </div>
        );
    }

    export default Projectdetails;