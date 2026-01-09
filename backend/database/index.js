const db = require("./db");
const User = require("./user");
const Poll = require("./poll");

// Set up associations
User.hasMany(Poll, { foreignKey: "creatorId", as: "polls" });
Poll.belongsTo(User, { foreignKey: "creatorId", as: "creator" });

module.exports = {
  db,
  User,
  Poll,
};
