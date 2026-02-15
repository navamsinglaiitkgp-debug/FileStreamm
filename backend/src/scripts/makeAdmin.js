require("../config/env");
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
    await mongoose.connect(process.env.MONGO_URI, {
        autoIndex: process.env.NODE_ENV !== "production", 
    });
    console.log("Connected to MongoDB");

    const email = "navamsingla3001@gmail.com";
    let user = await User.findOne({ email });
    if (user) {
        console.log(`User with email ${email} already exists.`);
    } else {
        user = new User({
            email,
            passwordHash: await require('bcrypt').hash("adminpassword", 10),
            role: "admin"
        });
        await user.save();
        console.log(`Admin user created with email: ${email} and password: adminpassword`);
    }
    process.exit(0);
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});