const express = require("express");
const router = express.Router();
const { Poll, User } = require("../database");
const { authenticateJWT, optionalAuthenticateJWT } = require("../auth");
const { Op } = require("sequelize");
const crypto = require("crypto");

// Generate a unique share link
const generateShareLink = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Create a new poll (no authentication required)
router.post("/", optionalAuthenticateJWT, async (req, res) => {
  try {
    const { title, options, image } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).send({ error: "Poll title is required" });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res
        .status(400)
        .send({ error: "At least 2 options are required" });
    }

    // Normalize options: convert strings to objects, or use objects directly
    const normalizedOptions = options.map((opt) => {
      if (typeof opt === "string") {
        // Backward compatibility: convert string to object
        return { text: opt.trim(), image: null };
      } else if (opt && typeof opt === "object") {
        // Already an object with text and image
        return {
          text: (opt.text || "").trim(),
          image: opt.image || null,
        };
      }
      return null;
    }).filter((opt) => opt !== null && opt.text.length > 0);

    if (normalizedOptions.length < 2) {
      return res
        .status(400)
        .send({ error: "At least 2 non-empty options are required" });
    }

    // Check for duplicate option texts
    const optionTexts = normalizedOptions.map((opt) => opt.text);
    const uniqueTexts = [...new Set(optionTexts)];
    if (uniqueTexts.length !== optionTexts.length) {
      return res.status(400).send({ error: "Poll options must be unique" });
    }

    // Generate unique share link
    let shareLink = generateShareLink();
    let linkExists = await Poll.findOne({ where: { shareLink } });
    while (linkExists) {
      shareLink = generateShareLink();
      linkExists = await Poll.findOne({ where: { shareLink } });
    }

    const poll = await Poll.create({
      title: title.trim(),
      options: normalizedOptions,
      creatorId: req.user ? req.user.id : null,
      status: "draft",
      shareLink,
      image: image || null,
    });

    const pollWithCreator = await Poll.findByPk(poll.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username"],
          required: false,
        },
      ],
    });

    res.status(201).send({ poll: pollWithCreator });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).send({ error: "Failed to create poll" });
  }
});

// Get all polls for the authenticated user
router.get("/my-polls", authenticateJWT, async (req, res) => {
  try {
    const polls = await Poll.findAll({
      where: { creatorId: req.user.id },
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
    console.error("Error fetching polls:", error);
    res.status(500).send({ error: "Failed to fetch polls" });
  }
});

// Get all polls with optional search (public, no auth required)
router.get("/all", async (req, res) => {
  try {
    const { search } = req.query;
    const { db } = require("../database");

    let whereClause = {};
    if (search && search.trim()) {
      const searchTerm = search.trim();
      // Search in title and options (JSONB structure)
      whereClause = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          // Search in JSONB options array for text field
          db.literal(`options::text ILIKE '%"text":"%${searchTerm}%"%'`),
        ],
      };
    }

    const polls = await Poll.findAll({
      where: whereClause,
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
    console.error("Error fetching polls:", error);
    res.status(500).send({ error: "Failed to fetch polls" });
  }
});

// Get a poll by share link (public, no auth required)
router.get("/share/:shareLink", async (req, res) => {
  try {
    const { shareLink } = req.params;
    const poll = await Poll.findOne({
      where: { shareLink },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username"],
          required: false,
        },
      ],
    });

    if (!poll) {
      return res.status(404).send({ error: "Poll not found" });
    }

    res.send({ poll });
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).send({ error: "Failed to fetch poll" });
  }
});

// Get a poll by ID (for creator)
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username"],
          required: false,
        },
      ],
    });

    if (!poll) {
      return res.status(404).send({ error: "Poll not found" });
    }

    // Check if user is the creator
    if (poll.creatorId !== req.user.id) {
      return res.status(403).send({ error: "Access denied" });
    }

    res.send({ poll });
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).send({ error: "Failed to fetch poll" });
  }
});

// Update poll status (open/close)
router.patch("/:id/status", authenticateJWT, async (req, res) => {
  try {
    const { status } = req.body;
    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return res.status(404).send({ error: "Poll not found" });
    }

    if (poll.creatorId !== req.user.id) {
      return res.status(403).send({ error: "Access denied" });
    }

    if (!["draft", "open", "closed"].includes(status)) {
      return res.status(400).send({ error: "Invalid status" });
    }

    poll.status = status;
    await poll.save();

    const pollWithCreator = await Poll.findByPk(poll.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username"],
          required: false,
        },
      ],
    });

    res.send({ poll: pollWithCreator });
  } catch (error) {
    console.error("Error updating poll status:", error);
    res.status(500).send({ error: "Failed to update poll status" });
  }
});

module.exports = router;

