require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const admin = new User({
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });

    await admin.save();
    console.log("Admin created: admin@example.com / admin123");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();