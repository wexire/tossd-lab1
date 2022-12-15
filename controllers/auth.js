const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authUserModel = require("../models/authUser");

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await authUserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      result: user,
      token: `Bearer ${token}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await authUserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await authUserModel.create({
      email,
      password: hashedPassword,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};