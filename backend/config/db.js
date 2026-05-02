const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const initializeAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: "admin" });

        if (!adminExists) {
            await User.create({
                name: "Admin User",
                email: "admin@gmail.com",
                password: "123456",
                role: "admin",
            });

            console.log("Admin created: admin@gmail.com / 123456");
        } else {
            adminExists.role = "admin";
            adminExists.status = "active";
            await adminExists.save();
            console.log("Admin verified and active");
        }
    } catch (error) {
        console.error("Error initializing admin:", error.message);
    }
};

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        console.log(`Connecting to: ${uri ? uri.substring(0, 20) + '...' : 'UNDEFINED'}`);
        await mongoose.connect(uri);
        console.log("MongoDB Connected");

        // ✅ CALL AFTER CONNECTION
        await initializeAdmin();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;