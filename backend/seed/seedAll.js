const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

// Load environment variables from .env file
dotenv.config();

// --- 1. Import Mongoose Models ---
// Adjust the paths if your folder structure is different
const User = require("../models/User");
const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Message = require("../models/Message");

// --- 2. Database Connection ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env file. Please add it.");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // --- Optional: Clear previous data ---
    console.log("🗑️ Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Proposal.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log("🗑️ Data cleared successfully.");

    // --- Data Definitions ---
    const commonSkills = [
      "React",
      "Node.js",
      "MongoDB",
      "JavaScript",
      "Python",
      "Django",
      "Vue.js",
      "Angular",
      "AWS",
      "Docker",
      "UI/UX Design",
      "Figma",
      "Graphic Design",
      "Content Writing",
      "SEO",
      "Digital Marketing",
      "Mobile App Development",
      "TypeScript",
      "HTML/CSS",
      "SQL",
      "GraphQL",
    ];
    const projectCategories = [
      "Web Development",
      "Mobile App Development",
      "UI/UX Design",
      "Graphic Design",
      "Content Writing",
      "Digital Marketing",
      "Data Science",
      "Backend Development",
    ];

    // --- 3. Seed Users ---
    console.log("🌱 Seeding Users...");
    const usersToInsert = [];
    const numberOfUsers = 30; // Create a good number of users
    for (let i = 0; i < numberOfUsers; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const userRoles = faker.helpers.arrayElements(
        [["client"], ["freelancer"], ["client", "freelancer"]],
        1
      )[0];

      usersToInsert.push({
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        firebaseUID: `firebase_uid_${faker.string.uuid()}`,
        bio: faker.person.bio(),
        profileImage: faker.image.avatar(),
        location: `${faker.location.city()}, ${faker.location.country()}`,
        phoneNumber: faker.phone.number(),
        skills: userRoles.includes("freelancer")
          ? faker.helpers.arrayElements(commonSkills, { min: 3, max: 8 })
          : [],
        experience: userRoles.includes("freelancer")
          ? [
              {
                company: faker.company.name(),
                role: faker.person.jobTitle(),
                startDate: faker.date.past({ years: 5 }),
                endDate: faker.date.past({ years: 1 }),
                description: faker.lorem.sentence(),
              },
            ]
          : [],
        education: [
          {
            school: `${faker.location.city()} University`,
            degree: faker.person.jobArea(),
            startYear: 2015,
            endYear: 2019,
          },
        ],
        paymentInfo: {
          upiId: faker.finance.routingNumber() + "@okbank",
          preferredMethod: "upi",
        },
        verification: {
          emailVerified: true,
          phoneVerified: faker.datatype.boolean(0.8),
        },
        roles: userRoles,
        currentRole: faker.helpers.arrayElement(userRoles),
      });
    }
    const insertedUsers = await User.insertMany(usersToInsert);
    console.log(`✅ ${insertedUsers.length} Users seeded.`);

    const clients = insertedUsers.filter((u) => u.roles.includes("client"));
    const freelancers = insertedUsers.filter((u) =>
      u.roles.includes("freelancer")
    );

    // --- 4. Seed Projects ---
    console.log("🌱 Seeding Projects...");
    const projectsToInsert = [];
    for (const client of clients) {
      const numProjects = faker.number.int({ min: 0, max: 4 }); // Some clients might not have projects yet
      for (let i = 0; i < numProjects; i++) {
        projectsToInsert.push({
          title: faker.commerce.productName() + " Initiative",
          description: faker.lorem.paragraphs({ min: 2, max: 4 }),
          category: faker.helpers.arrayElement(projectCategories),
          budget: faker.number.int({ min: 5000, max: 150000 }),
          deadline: faker.date.soon({ days: 120 }),
          status: "open",
          client: client._id,
        });
      }
    }
    let insertedProjects = await Project.insertMany(projectsToInsert);
    console.log(`✅ ${insertedProjects.length} Projects seeded.`);

    // --- 5. Seed Proposals ---
    console.log("🌱 Seeding Proposals...");
    const proposalsToInsert = [];
    for (const project of insertedProjects) {
      const numProposals = faker.number.int({ min: 2, max: 8 });
      const potentialProposers = freelancers.filter(
        (f) => !f._id.equals(project.client)
      );
      if (potentialProposers.length === 0) continue;

      const proposers = faker.helpers.arrayElements(potentialProposers, {
        min: 1,
        max: Math.min(numProposals, potentialProposers.length),
      });

      for (const proposer of proposers) {
        proposalsToInsert.push({
          freelancer: proposer._id,
          client: project.client,
          project: project._id,
          coverLetter: faker.lorem.paragraph({ min: 2, max: 4 }),
          totalBidAmount: faker.number.int({
            min: project.budget * 0.85,
            max: project.budget * 1.25,
          }),
          deliveryTime: faker.number.int({ min: 7, max: 90 }),
          status: "pending",
        });
      }
    }
    const insertedProposals = await Proposal.insertMany(proposalsToInsert);
    console.log(`✅ ${insertedProposals.length} Proposals seeded.`);

    // --- 6. Process Proposals and Update Projects ---
    console.log("🔄 Processing proposals and updating projects...");
    const acceptedProposals = [];
    for (const project of insertedProjects) {
      const projectProposals = insertedProposals.filter((p) =>
        p.project.equals(project._id)
      );
      if (projectProposals.length === 0) continue;

      if (faker.datatype.boolean(0.85)) {
        // High chance to move a project forward
        const proposalToAccept = faker.helpers.arrayElement(projectProposals);

        await Proposal.findByIdAndUpdate(proposalToAccept._id, {
          status: "accepted",
        });
        acceptedProposals.push(proposalToAccept);

        await Proposal.updateMany(
          {
            _id: {
              $in: projectProposals
                .filter((p) => !p._id.equals(proposalToAccept._id))
                .map((p) => p._id),
            },
          },
          { status: "rejected" }
        );

        await Project.findByIdAndUpdate(project._id, {
          status: "in-progress",
          assignedFreelancer: proposalToAccept.freelancer,
        });
      }
    }
    console.log(
      `✅ ${acceptedProposals.length} proposals accepted and projects moved to 'in-progress'.`
    );

    // --- 7. Move some projects to completed/pending-review ---
    const inProgressProjects = await Project.find({ status: "in-progress" });
    const projectsToComplete = faker.helpers.arrayElements(inProgressProjects, {
      min: 2,
      max: Math.floor(inProgressProjects.length / 2),
    });

    for (const project of projectsToComplete) {
      await Project.findByIdAndUpdate(project._id, {
        status: faker.helpers.arrayElement(["completed", "pending-review"]),
      });
    }
    console.log(
      `✅ ${projectsToComplete.length} projects moved to 'completed' or 'pending-review'.`
    );

    // --- 8. Seed Payments ---
    console.log("🌱 Seeding Payments...");
    const paymentsToInsert = [];
    for (const proposal of acceptedProposals) {
      const project = await Project.findById(proposal.project);
      if (!project || project.status === "open") continue;

      const paymentStatus = ["completed", "pending-review"].includes(
        project.status
      )
        ? "released"
        : "in_escrow";

      paymentsToInsert.push({
        proposal: proposal._id,
        project: project._id,
        client: proposal.client,
        freelancer: proposal.freelancer,
        amount: proposal.totalBidAmount,
        status: paymentStatus,
        method: "razorpay",
        transactionId: `txn_${faker.string.alphanumeric(16)}`,
        releasedAt:
          paymentStatus === "released" ? faker.date.recent({ days: 10 }) : null,
      });
    }
    const insertedPayments = await Payment.insertMany(paymentsToInsert);
    console.log(`✅ ${insertedPayments.length} Payments seeded.`);

    // --- 9. Seed Reviews ---
    console.log("🌱 Seeding Reviews...");
    const reviewsToInsert = [];
    const completedProjects = await Project.find({
      status: "completed",
      assignedFreelancer: { $ne: null },
    });
    for (const project of completedProjects) {
      reviewsToInsert.push({
        reviewer: project.client,
        reviewee: project.assignedFreelancer,
        rating: faker.number.int({ min: 4, max: 5 }),
        comment: faker.lorem.sentence(),
        project: project._id,
      });
      reviewsToInsert.push({
        reviewer: project.assignedFreelancer,
        reviewee: project.client,
        rating: faker.number.int({ min: 4, max: 5 }),
        comment: faker.lorem.sentence(),
        project: project._id,
      });
    }
    const insertedReviews = await Review.insertMany(reviewsToInsert);
    console.log(`✅ ${insertedReviews.length} Reviews seeded.`);

    // --- 10. Seed Messages ---
    console.log("🌱 Seeding Messages...");
    const messagesToInsert = [];
    const activeProjects = await Project.find({
      status: { $in: ["in-progress", "completed", "pending-review"] },
      assignedFreelancer: { $ne: null },
    });
    for (const project of activeProjects) {
      for (let i = 0; i < faker.number.int({ min: 6, max: 20 }); i++) {
        const [sender, receiver] = faker.helpers.arrayElement([
          [project.client, project.assignedFreelancer],
          [project.assignedFreelancer, project.client],
        ]);
        messagesToInsert.push({
          roomid: project._id.toString(), // Use project ID as room ID
          sender,
          receiver,
          content: faker.lorem.sentence(),
          seen: faker.datatype.boolean(0.9),
        });
      }
    }
    await Message.insertMany(messagesToInsert);
    console.log(`✅ ${messagesToInsert.length} Messages seeded.`);

    // --- 11. Final Update of User/Project Arrays ---
    console.log("🔄 Finalizing relationships...");
    const allProjectsFromDB = await Project.find().lean();
    const allProposalsFromDB = await Proposal.find().lean();
    const allReviewsFromDB = await Review.find().lean();

    for (const user of insertedUsers) {
      const postedProjects = allProjectsFromDB
        .filter((p) => p.client.equals(user._id))
        .map((p) => p._id);
      const takenProjects = allProjectsFromDB
        .filter(
          (p) => p.assignedFreelancer && p.assignedFreelancer.equals(user._id)
        )
        .map((p) => p._id);
      const reviews = allReviewsFromDB
        .filter((r) => r.reviewee.equals(user._id))
        .map((r) => r._id);

      await User.findByIdAndUpdate(user._id, {
        $set: { postedProjects, takenProjects, reviews },
      });
    }

    for (const project of allProjectsFromDB) {
      const proposals = allProposalsFromDB
        .filter((p) => p.project.equals(project._id))
        .map((p) => p._id);
      await Project.findByIdAndUpdate(project._id, { $set: { proposals } });
    }
    console.log("✅ Relationships finalized.");
    console.log("\n✨ Database seeding completed successfully! ✨");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
};

seedDatabase();
