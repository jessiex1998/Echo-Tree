#!/usr/bin/env node

/**
 * Reset Account Lock Script
 *
 * Usage:
 *   node scripts/reset-account.js <username>
 *   node scripts/reset-account.js testuser999
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

const username = process.argv[2];

if (!username) {
  console.error('❌ Error: Username is required');
  console.log('\nUsage: node scripts/reset-account.js <username>');
  console.log('Example: node scripts/reset-account.js testuser999');
  process.exit(1);
}

async function resetAccount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find and reset user
    const user = await User.findOne({ username });

    if (!user) {
      console.error(`❌ User "${username}" not found`);
      process.exit(1);
    }

    console.log(`\n📋 Current status for "${username}":`);
    console.log(`   - Failed attempts: ${user.failed_login_attempts}`);
    console.log(`   - Account locked until: ${user.account_locked_until || 'Not locked'}`);
    console.log(`   - Status: ${user.status}`);

    // Reset account lock
    user.failed_login_attempts = 0;
    user.account_locked_until = null;
    await user.save();

    console.log(`\n✅ Account "${username}" has been reset!`);
    console.log(`   - Failed attempts: 0`);
    console.log(`   - Account locked until: null`);
    console.log(`\n🎉 You can now login again!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

resetAccount();
