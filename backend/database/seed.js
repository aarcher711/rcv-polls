const db = require("./db");
const { User, Poll } = require("./index");
const crypto = require("crypto");

// Generate a unique share link
const generateShareLink = () => {
  return crypto.randomBytes(8).toString("hex");
};

const seed = async () => {
  try {
    db.logging = false;
    await db.sync({ force: true }); // Drop and recreate tables

    // Create test users with various scenarios
    const users = await User.bulkCreate([
      {
        username: "admin",
        passwordHash: User.hashPassword("admin123"),
        email: "admin@example.com",
        bio: "Administrator account for testing purposes.",
      },
      {
        username: "alice",
        passwordHash: User.hashPassword("alice123"),
        email: "alice@example.com",
        bio: "Poll enthusiast and voting advocate. Love creating polls about food and travel!",
      },
      {
        username: "bob",
        passwordHash: User.hashPassword("bob123"),
        email: "bob@example.com",
        bio: "Tech geek who loves ranked choice voting systems.",
      },
      {
        username: "charlie",
        passwordHash: User.hashPassword("charlie123"),
        email: "charlie@example.com",
        bio: null, // User without bio
      },
      {
        username: "diana",
        passwordHash: User.hashPassword("diana123"),
        email: "diana@example.com",
        bio: "Event organizer. Use polls to decide on group activities!",
      },
      {
        username: "eve",
        passwordHash: User.hashPassword("eve123"),
        email: "eve@example.com",
        bio: "New to the platform. Excited to create my first poll!",
      },
      {
        username: "frank",
        passwordHash: User.hashPassword("frank123"),
        email: "frank@example.com",
        bio: null,
      },
      {
        username: "grace",
        passwordHash: User.hashPassword("grace123"),
        email: "grace@example.com",
        bio: "Teacher using polls for classroom decisions.",
      },
    ]);

    console.log(`👤 Created ${users.length} test users`);

    // Create test polls for various users
    const polls = await Poll.bulkCreate([
      {
        title: "What should we have for lunch today?",
        options: [
          { text: "Pizza", image: null },
          { text: "Sushi", image: null },
          { text: "Burgers", image: null },
          { text: "Salad", image: null },
        ],
        status: "open",
        shareLink: generateShareLink(),
        creatorId: users[1].id, // alice
      },
      {
        title: "Best programming language for beginners?",
        options: [
          { text: "Python", image: null },
          { text: "JavaScript", image: null },
          { text: "Java", image: null },
        ],
        status: "open",
        shareLink: generateShareLink(),
        creatorId: users[2].id, // bob
      },
      {
        title: "Favorite vacation destination?",
        options: [
          { text: "Beach", image: null },
          { text: "Mountains", image: null },
          { text: "City", image: null },
          { text: "Countryside", image: null },
        ],
        status: "open",
        shareLink: generateShareLink(),
        creatorId: users[1].id, // alice
      },
      {
        title: "Which movie should we watch tonight?",
        options: [
          { text: "Action Movie", image: null },
          { text: "Comedy", image: null },
          { text: "Horror", image: null },
        ],
        status: "draft",
        shareLink: generateShareLink(),
        creatorId: users[3].id, // charlie
      },
      {
        title: "Team building activity preference?",
        options: [
          { text: "Escape Room", image: null },
          { text: "Cooking Class", image: null },
          { text: "Outdoor Adventure", image: null },
          { text: "Board Games", image: null },
        ],
        status: "open",
        shareLink: generateShareLink(),
        creatorId: users[4].id, // diana
      },
      {
        title: "Coffee shop order preference",
        options: [
          { text: "Espresso", image: null },
          { text: "Cappuccino", image: null },
          { text: "Latte", image: null },
          { text: "Americano", image: null },
        ],
        status: "closed",
        shareLink: generateShareLink(),
        creatorId: users[0].id, // admin
      },
      {
        title: "Best time for the meeting?",
        options: [
          { text: "Morning (9-11 AM)", image: null },
          { text: "Afternoon (1-3 PM)", image: null },
          { text: "Evening (4-6 PM)", image: null },
        ],
        status: "open",
        shareLink: generateShareLink(),
        creatorId: users[7].id, // grace
      },
    ]);

    console.log(`📊 Created ${polls.length} test polls`);

    // Print test credentials for easy reference
    console.log("\n📝 Test User Credentials:");
    console.log("=" .repeat(50));
    users.forEach((user) => {
      const password = user.username + "123";
      console.log(`Username: ${user.username.padEnd(10)} | Password: ${password}`);
    });
    console.log("=" .repeat(50));
    console.log("\n💡 Tip: All test users have passwords in the format: username123");
    console.log("🌱 Seeded the database successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.message.includes("does not exist")) {
      console.log("\n🤔🤔🤔 Have you created your database??? 🤔🤔🤔");
    }
  }
  db.close();
};

seed();
