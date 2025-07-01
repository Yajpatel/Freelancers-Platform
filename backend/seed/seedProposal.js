const Proposal = require('../models/Proposal');

const proposalSeedData = async (projects, users) => {
  const proposals = await Proposal.insertMany([
    {
      freelancer: users[2]._id,
      project: projects[0]._id,
      coverLetter: 'Hi, I can deliver this website quickly.',
      proposedRate: 480,
      status: 'pending'
    },
    {
      freelancer: users[0]._id,
      project: projects[1]._id,
      coverLetter: 'I’m great at graphic design. Let’s work together.',
      proposedRate: 290,
      status: 'accepted'
    }
  ]);

  console.log('✅ Proposals seeded');
  return proposals;
};

module.exports = proposalSeedData;
