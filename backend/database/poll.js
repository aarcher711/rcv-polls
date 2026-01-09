const { DataTypes } = require("sequelize");
const db = require("./db");

const Poll = db.define("poll", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      minOptions(value) {
        if (!value || !Array.isArray(value) || value.length < 2) {
          throw new Error("A poll must have at least 2 options");
        }
      },
    },
  },
  status: {
    type: DataTypes.ENUM("draft", "open", "closed"),
    defaultValue: "draft",
  },
  shareLink: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Poll;

