const express = require("express");
const router = express.Router();
const { User, Poll } = require("../database");
const { authenticateJWT, optionalAuthenticateJWT } = require("../auth");

// Get user profile by ID or username (public)
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by username
    const user = await User.findOne({
      where: isNaN(identifier)
        ? { username: identifier }
        : { id: parseInt(identifier) },
      attributes: ["id", "username", "email", "bio", "avatar", "createdAt"],
      include: [
        {
          model: Poll,
          as: "polls",
          attributes: ["id", "title", "status", "shareLink", "createdAt", "image"],
          order: [["createdAt", "DESC"]],
          limit: 10, // Limit to recent 10 polls for profile
        },
      ],
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send({ error: "Failed to fetch user profile" });
  }
});

// Get current user's profile (authenticated)
router.get("/me/profile", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "bio", "avatar", "createdAt"],
      include: [
        {
          model: Poll,
          as: "polls",
          attributes: ["id", "title", "status", "shareLink", "createdAt", "image"],
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send({ error: "Failed to fetch user profile" });
  }
});

// Update user profile (authenticated)
router.patch("/me/profile", authenticateJWT, async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Update fields if provided
    if (bio !== undefined) {
      user.bio = bio;
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    const updatedUser = await User.findByPk(user.id, {
      attributes: ["id", "username", "email", "bio", "avatar", "createdAt"],
    });

    res.send({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send({ error: "Failed to update user profile" });
  }
});

// Get all polls by a specific user (public)
router.get("/:identifier/polls", async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Find user by ID or username
    const user = await User.findOne({
      where: isNaN(identifier)
        ? { username: identifier }
        : { id: parseInt(identifier) },
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const polls = await Poll.findAll({
      where: { creatorId: user.id },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.send({ polls });
  } catch (error) {
    console.error("Error fetching user polls:", error);
    res.status(500).send({ error: "Failed to fetch user polls" });
  }
});

module.exports = router;

