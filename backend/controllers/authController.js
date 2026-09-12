import jwt from "jsonwebtoken";
import User from "../models/User.js";

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email aur password zaroori hain" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Is email se pehle se account bana hua hai" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Signup fail hua", error: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email ya password galat hai" });
    }

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Login fail hua", error: err.message });
  }
}

// GET /api/auth/me
// Returns the currently logged-in user's profile (from the JWT, via protect middleware)
async function getMe(req, res) {
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email });
}

// PATCH /api/auth/profile
// Body: { name, email }
async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name aur email dono chahiye" });
    }

    const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (existing) {
      return res.status(409).json({ message: "Ye email kisi aur account mein already use ho raha hai" });
    }

    const user = await User.findById(req.user._id);
    user.name = name;
    user.email = email;
    await user.save();

    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Profile update nahi hua", error: err.message });
  }
}

// PATCH /api/auth/password
// Body: { currentPassword, newPassword }
async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current aur new password dono chahiye" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Naya password kam se kam 6 characters ka hona chahiye" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password galat hai" });
    }

    user.password = newPassword; // pre-save hook in the User model hashes this automatically
    await user.save();

    res.json({ message: "Password successfully change ho gaya" });
  } catch (err) {
    res.status(500).json({ message: "Password change nahi hua", error: err.message });
  }
}

export { signup, login, getMe, updateProfile, updatePassword };