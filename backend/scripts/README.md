# Database Management Scripts

This directory contains utility scripts for managing the EchoTree database during development and testing.

---

## Account Lock Management

### Reset Single Account

Reset a specific user's account lock and failed login attempts:

```bash
node scripts/reset-account.js <username>
```

**Example**:
```bash
node scripts/reset-account.js testuser999
```

**Output**:
```
✅ Connected to MongoDB

📋 Current status for "testuser999":
   - Failed attempts: 5
   - Account locked until: 2025-11-28T23:00:00.000Z
   - Status: active

✅ Account "testuser999" has been reset!
   - Failed attempts: 0
   - Account locked until: null

🎉 You can now login again!
```

---

### Reset All Accounts

Reset all accounts in the database (useful for testing):

```bash
node scripts/reset-all-accounts.js
```

**Output**:
```
✅ Connected to MongoDB

📋 Found 3 account(s) with login issues:

1. testuser999
   - Failed attempts: 5
   - Locked until: 2025-11-28T23:00:00.000Z
   - Status: active

2. testuser001
   - Failed attempts: 3
   - Locked until: Not locked
   - Status: active

✅ Reset complete!
   - Modified 2 account(s)

🎉 All accounts are now unlocked and ready to login!
```

---

## Quick Reference: Account Lock Rules

- **Lock Trigger**: 5 consecutive failed login attempts
- **Lock Duration**: 15 minutes
- **Auto Unlock**: Account automatically unlocks after 15 minutes
- **Manual Unlock**: Use scripts above to unlock immediately

---

## Alternative: MongoDB Shell Commands

If you prefer using MongoDB shell directly:

### Reset Single Account
```javascript
mongosh echotree --eval 'db.users.updateOne(
  {username: "testuser999"},
  {$set: {failed_login_attempts: 0, account_locked_until: null}}
)'
```

### Reset All Accounts
```javascript
mongosh echotree --eval 'db.users.updateMany(
  {},
  {$set: {failed_login_attempts: 0, account_locked_until: null}}
)'
```

### Check Account Status
```javascript
mongosh echotree --eval 'db.users.findOne(
  {username: "testuser999"},
  {username: 1, failed_login_attempts: 1, account_locked_until: 1, status: 1}
)'
```

---

## Troubleshooting

### Script Fails to Connect
**Error**: `MongooseError: Connection failed`

**Solution**:
1. Check MongoDB is running: `brew services list | grep mongodb`
2. Check connection string in `.env`: `MONGODB_URI=mongodb://localhost:27017/echotree`
3. Test connection: `mongosh echotree --eval 'db.getName()'`

### User Not Found
**Error**: `User "testuser999" not found`

**Solution**:
1. Check username spelling
2. List all users: `mongosh echotree --eval 'db.users.find({}, {username: 1})'`

### Permission Denied
**Error**: `Error: EACCES: permission denied`

**Solution**:
1. Make script executable: `chmod +x scripts/reset-account.js`
2. Or run with node: `node scripts/reset-account.js testuser999`

---

## Testing Workflow

When testing authentication features:

1. **Test Failed Logins**: Try wrong password 5 times
2. **Verify Lock**: 6th attempt should return `423 Locked`
3. **Reset Account**: Run `node scripts/reset-account.js <username>`
4. **Test Success**: Login should now work with correct password

---

## Future Scripts (TODO)

- [ ] `create-test-users.js` - Generate multiple test users
- [ ] `delete-test-data.js` - Clean up test data
- [ ] `seed-database.js` - Populate database with sample data
- [ ] `backup-database.js` - Create database backup
- [ ] `restore-database.js` - Restore from backup

---

**Last Updated**: 2025-11-28
