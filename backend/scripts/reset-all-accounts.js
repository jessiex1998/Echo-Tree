#!/usr/bin/env node

/**
 * Reset All Account Locks Script
 *
 * This script resets failed login attempts and unlocks all accounts
 *
 * Usage:
 *   node scripts/reset-all-accounts.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

async function resetAllAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all locked or failed accounts
    const lockedUsers = await User.find({
      $or: [
        { failed_login_attempts: { $gt: 0 } },
        { account_locked_until: { $ne: null } },
      ],
    }).select('username failed_login_attempts account_locked_until status');

    if (lockedUsers.length === 0) {
      console.log('\n✅ No locked accounts found. All accounts are already unlocked!');
    } else {
      console.log(`\n📋 Found ${lockedUsers.length} account(s) with login issues:\n`);

      lockedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username}`);
        console.log(`   - Failed attempts: ${user.failed_login_attempts}`);
        console.log(`   - Locked until: ${user.account_locked_until || 'Not locked'}`);
        console.log(`   - Status: ${user.status}\n`);
      });

      // Reset all accounts
      const result = await User.updateMany(
        {},
        {
          $set: {
            failed_login_attempts: 0,
            account_locked_until: null,
          },
        }
      );

      console.log(`✅ Reset complete!`);
      console.log(`   - Modified ${result.modifiedCount} account(s)`);
      console.log(`\n🎉 All accounts are now unlocked and ready to login!`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

resetAllAccounts();
