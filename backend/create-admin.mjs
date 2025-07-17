import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from "./config/db.mjs";
import User from "./models/User.mjs";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'superadmin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_2025';

    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log(`Admin user with email '${adminEmail}' already exists.`);
      mongoose.connection.close();
      process.exit();
    }

    const admin = await User.create({
      username: 'superadmin',
      name: 'Super Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log('--- Admin User Created Successfully! ---');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminPassword}`);
    console.log('----------------------------------------');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();
