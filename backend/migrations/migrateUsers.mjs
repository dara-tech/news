import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from "../config/db.mjs";
import User from "../models/User.mjs";

dotenv.config();

const migrateUsers = async () => {
  await connectDB();

  try {
    const usersCollection = mongoose.connection.db.collection('users');
    const usersToMigrate = await usersCollection.find({
      $or: [
        { name: { $exists: true } },
        { isAdmin: { $exists: true } }
      ]
    }).toArray();

    if (usersToMigrate.length === 0) {
      process.exit();
    }

    let migratedCount = 0;
    for (const user of usersToMigrate) {
      const updateOps = { $set: {}, $unset: {} };

      // Migrate name to username
      if (user.name && !user.username) {
        updateOps.$set.username = user.name;
        updateOps.$unset.name = "";
      }

      // Migrate isAdmin to role
      if (typeof user.isAdmin === 'boolean' && !user.role) {
        updateOps.$set.role = user.isAdmin ? 'admin' : 'user';
        updateOps.$unset.isAdmin = "";
      }

      if (Object.keys(updateOps.$set).length > 0) {
        await usersCollection.updateOne({ _id: user._id }, updateOps);
        migratedCount++;
      }
    }

    process.exit();
  } catch (error) {
    process.exit(1);
  }
};

migrateUsers();
