#!/usr/bin/env node

/**
 * Reset Database Script
 *
 * This script provides options to reset the database:
 * 1. Clear all data (keep collections and indexes)
 * 2. Drop all collections (complete reset)
 * 3. Clear test data only (users starting with "test")
 *
 * Usage:
 *   node scripts/reset-database.js [option]
 *
 * Options:
 *   --clear-all      Clear all data from all collections
 *   --drop-all       Drop all collections completely
 *   --clear-test     Clear only test data (recommended)
 *   --help           Show this help message
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'readline';

// Load environment variables
dotenv.config();

const option = process.argv[2];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function clearAllData() {
  console.log('\n⚠️  CLEARING ALL DATA FROM ALL COLLECTIONS...\n');

  const collections = await mongoose.connection.db.collections();

  let totalDeleted = 0;
  for (const collection of collections) {
    const result = await collection.deleteMany({});
    console.log(`  ✅ ${collection.collectionName}: ${result.deletedCount} documents deleted`);
    totalDeleted += result.deletedCount;
  }

  console.log(`\n✅ Total: ${totalDeleted} documents deleted`);
  console.log('📦 Collections and indexes preserved');
}

async function dropAllCollections() {
  console.log('\n⚠️  DROPPING ALL COLLECTIONS...\n');

  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.drop();
    console.log(`  ✅ Dropped collection: ${collection.collectionName}`);
  }

  console.log(`\n✅ All collections dropped`);
  console.log('⚠️  Indexes will be recreated on next server start');
}

async function clearTestData() {
  console.log('\n🧹 CLEARING TEST DATA...\n');

  const db = mongoose.connection.db;
  let totalDeleted = 0;

  // Delete test users (username starts with "test")
  const usersCollection = db.collection('users');
  const usersResult = await usersCollection.deleteMany({
    username: /^test/i,
  });
  console.log(`  ✅ Test users: ${usersResult.deletedCount} deleted`);
  totalDeleted += usersResult.deletedCount;

  // Get IDs of deleted users
  const testUserIds = await usersCollection
    .find({ username: /^test/i })
    .project({ _id: 1 })
    .toArray();
  const testUserIdArray = testUserIds.map((u) => u._id);

  // Delete sessions of test users
  const sessionsCollection = db.collection('usersessions');
  const sessionsResult = await sessionsCollection.deleteMany({
    user_id: { $in: testUserIdArray },
  });
  console.log(`  ✅ Test user sessions: ${sessionsResult.deletedCount} deleted`);
  totalDeleted += sessionsResult.deletedCount;

  // Delete chats of test users
  const chatsCollection = db.collection('chats');
  const chatsResult = await chatsCollection.deleteMany({
    user_id: { $in: testUserIdArray },
  });
  console.log(`  ✅ Test user chats: ${chatsResult.deletedCount} deleted`);
  totalDeleted += chatsResult.deletedCount;

  // Delete messages from test chats
  const testChatIds = await chatsCollection
    .find({ user_id: { $in: testUserIdArray } })
    .project({ _id: 1 })
    .toArray();
  const testChatIdArray = testChatIds.map((c) => c._id);

  const messagesCollection = db.collection('messages');
  const messagesResult = await messagesCollection.deleteMany({
    chat_id: { $in: testChatIdArray },
  });
  console.log(`  ✅ Test chat messages: ${messagesResult.deletedCount} deleted`);
  totalDeleted += messagesResult.deletedCount;

  // Delete notes of test users
  const notesCollection = db.collection('notes');
  const notesResult = await notesCollection.deleteMany({
    user_id: { $in: testUserIdArray },
  });
  console.log(`  ✅ Test user notes: ${notesResult.deletedCount} deleted`);
  totalDeleted += notesResult.deletedCount;

  // Delete replies from test notes
  const testNoteIds = await notesCollection
    .find({ user_id: { $in: testUserIdArray } })
    .project({ _id: 1 })
    .toArray();
  const testNoteIdArray = testNoteIds.map((n) => n._id);

  const repliesCollection = db.collection('replies');
  const repliesResult = await repliesCollection.deleteMany({
    note_id: { $in: testNoteIdArray },
  });
  console.log(`  ✅ Test note replies: ${repliesResult.deletedCount} deleted`);
  totalDeleted += repliesResult.deletedCount;

  // Delete digests of test users
  const digestsCollection = db.collection('digests');
  const digestsResult = await digestsCollection.deleteMany({
    user_id: { $in: testUserIdArray },
  });
  console.log(`  ✅ Test user digests: ${digestsResult.deletedCount} deleted`);
  totalDeleted += digestsResult.deletedCount;

  // Delete penalties of test users
  const penaltiesCollection = db.collection('healerpenalties');
  const penaltiesResult = await penaltiesCollection.deleteMany({
    user_id: { $in: testUserIdArray },
  });
  console.log(`  ✅ Test user penalties: ${penaltiesResult.deletedCount} deleted`);
  totalDeleted += penaltiesResult.deletedCount;

  console.log(`\n✅ Total: ${totalDeleted} test documents deleted`);
  console.log('📦 Production data preserved');
}

async function showStats() {
  console.log('\n📊 DATABASE STATISTICS\n');

  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    const count = await collection.countDocuments();
    console.log(`  ${collection.collectionName}: ${count} documents`);
  }
}

async function showHelp() {
  console.log(`
📚 Database Reset Script

Usage:
  node scripts/reset-database.js [option]

Options:
  --clear-all      Clear all data from all collections (keeps structure)
  --drop-all       Drop all collections completely (full reset)
  --clear-test     Clear only test data (usernames starting with "test")
  --stats          Show database statistics
  --help           Show this help message

Examples:
  node scripts/reset-database.js --clear-test    # Safe: Only removes test data
  node scripts/reset-database.js --clear-all     # Removes all data
  node scripts/reset-database.js --drop-all      # Complete database reset
  node scripts/reset-database.js --stats         # View current data

Recommended:
  Use --clear-test during development to remove test data while preserving
  any real data you may have created.
`);
}

async function main() {
  try {
    if (option === '--help' || !option) {
      showHelp();
      process.exit(0);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB:', process.env.MONGODB_URI);

    if (option === '--stats') {
      await showStats();
      await mongoose.connection.close();
      console.log('\n✅ Database connection closed');
      process.exit(0);
    }

    // Show current stats
    await showStats();

    // Confirm action
    let confirmMessage = '';
    switch (option) {
      case '--clear-all':
        confirmMessage =
          '\n⚠️  WARNING: This will DELETE ALL DATA from the database!\nAre you sure? (yes/no): ';
        break;
      case '--drop-all':
        confirmMessage =
          '\n⚠️  WARNING: This will DROP ALL COLLECTIONS!\nThis is irreversible. Are you sure? (yes/no): ';
        break;
      case '--clear-test':
        confirmMessage =
          '\n🧹 This will delete all test data (usernames starting with "test").\nContinue? (yes/no): ';
        break;
      default:
        console.error(`\n❌ Unknown option: ${option}`);
        showHelp();
        process.exit(1);
    }

    const answer = await askQuestion(confirmMessage);

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Operation cancelled');
      process.exit(0);
    }

    // Execute action
    switch (option) {
      case '--clear-all':
        await clearAllData();
        break;
      case '--drop-all':
        await dropAllCollections();
        break;
      case '--clear-test':
        await clearTestData();
        break;
    }

    // Show final stats
    console.log('\n📊 FINAL DATABASE STATISTICS\n');
    await showStats();

    console.log('\n✅ Operation completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

main();
