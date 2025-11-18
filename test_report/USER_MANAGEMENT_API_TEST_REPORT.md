# Echo Tree - User Management Service API Test Report

**Base URL**: http://localhost:5176
**Service**: User Management Service

---

## Test Summary

| Category                 | Endpoint                                      | Status             |
| ------------------------ | --------------------------------------------- | ------------------ |
| User Management          | POST /api/users                               | ✅ PASS             |
| User Management          | GET /api/users/:userId                        | ✅ PASS             |
| User Management          | PATCH /api/users/:userId                      | ✅ PASS             |
| User Management          | DELETE /api/users/:userId                     | ✅ PASS             |
| Authentication           | POST /api/sessions                            | ✅ PASS             |
| Authentication           | GET /api/sessions/:sessionId                  | ✅ PASS             |
| Authentication           | DELETE /api/sessions/:sessionId               | ✅ PASS             |
| Sessions (Sub-resource)  | GET /api/users/:userId/sessions               | ✅ PASS             |
| Sessions (Sub-resource)  | DELETE /api/users/:userId/sessions/:sessionId | ✅ PASS             |
| Penalties (Sub-resource) | POST /api/users/:userId/penalties             | ⚠️  REQUIRES ADMIN |
| Penalties (Sub-resource) | GET /api/users/:userId/penalties              | ✅ PASS             |
| Penalties (Sub-resource) | PATCH /api/users/:userId/penalties            | ⚠️  REQUIRES ADMIN |

---

## 1. User Registration

### a) Use Case: Create a new user
**Resource(s)**: users
**HTTP Method**: POST
**Request URL**: `http://localhost:3000/api/users`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "username": "testuser1",
  "password": "test123456",
  "email": "test1@example.com"
}
```

**Expected Response** (Status: 201 Created):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "691ccc64ba685438e4301b86",
      "username": "testuser1",
      "email": "test1@example.com",
      "role": "teller"
    }
  }
}
```

**Test Result**: ✅ **PASS**
![[Pasted image 20251118132117.png]]

---

## 2. User Login (Create Session)

### b) Use Case: User login
**Resource(s)**: sessions
**HTTP Method**: POST
**Request URL**: `http://localhost:3000/api/sessions`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "username": "testuser1",
  "password": "test123456"
}
```

**Expected Response** (Status: 200 OK):
```json
{

"success": true,

"data": {

"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTFjZTM0NGJhNjg1NDM4ZTQzMDFiZDciLCJpYXQiOjE3NjM1MDExNjQsImV4cCI6MTc2NDEwNTk2NH0.9e0pydkdWoZJh88YqeOP31zaLtgovT1ZJ6bbazoQ8_o",

"user": {

"user_id": "691ce344ba685438e4301bd7",

"username": "testuser1",

"email": "test1@example.com",

"role": "teller",

"status": "active"

}

}

}
```

**Test Result**: ✅ **PASS**

![[Pasted image 20251118132636.png]]
---

## 3. Get User Information

### c) Use Case: Retrieve user profile
**Resource(s)**: users
**HTTP Method**: GET
**Request URL**: `{{baseUrl}}/api/users/691ce344ba685438e4301bd7`

**Request Headers**:
![[Pasted image 20251118133824.png]]
**Request Body**: None

**Expected Response** (Status: 200 OK):
```json
{

"success": true,

"data": {

"_id": "691ce344ba685438e4301bd7",

"username": "testuser1",

"email": "test1@example.com",

"role": "teller",

"status": "active",

"failed_login_attempts": 0,

"account_locked_until": null,

"created_at": "2025-11-18T21:21:08.592Z",

"createdAt": "2025-11-18T21:21:08.593Z",

"updatedAt": "2025-11-18T21:26:04.212Z",

"__v": 0,

"last_login": "2025-11-18T21:26:04.212Z",

"user_id": "691ce344ba685438e4301bd7",

"id": "691ce344ba685438e4301bd7"

}

}
```

**Test Result**: ✅ **PASS**
![[Pasted image 20251118133739.png]]

---

## 4. Update User Profile

### d) Use Case: Update user email
**Resource(s)**: users
**HTTP Method**: PATCH
**Request URL**: `http://localhost:3000/api/users/691ce344ba685438e4301bd7`

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "newemail@example.com"
}
```

**Expected Response** (Status: 200 OK):
```json
{

"success": true,

"data": {

"_id": "691ce344ba685438e4301bd7",

"username": "testuser1",

"password_hash": "$2a$10$vh6/KXzeXSlIs5dGZ..D9OS1KvN9d9jnED280jnppz4tEy.jvJOMm",

"password_salt": "$2a$10$vh6/KXzeXSlIs5dGZ..D9O",

"email": "newemail@example.com",

"role": "teller",

"status": "active",

"failed_login_attempts": 0,

"account_locked_until": null,

"created_at": "2025-11-18T21:21:08.592Z",

"createdAt": "2025-11-18T21:21:08.593Z",

"updatedAt": "2025-11-18T21:50:51.248Z",

"__v": 0,

"last_login": "2025-11-18T21:47:05.522Z",

"user_id": "691ce344ba685438e4301bd7",

"id": "691ce344ba685438e4301bd7"

}

}
```

**Test Result**: ✅ **PASS**
![[Pasted image 20251118135106.png]]
---

## 5. Get User Sessions (Sub-resource)

### e) Use Case: Retrieve all active sessions for a user
**Resource(s)**: users/sessions
**HTTP Method**: GET
**Request URL**: `{{baseUrl}}/api/users/691ce344ba685438e4301bd7/sessions`

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters**:
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Request Body**: None

**Expected Response** (Status: 200 OK):
```json
{

"success": true,

"data": [

{

"_id": "691ce959ba685438e4301bf1",

"user_id": "691ce344ba685438e4301bd7",

"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTFjZTM0NGJhNjg1NDM4ZTQzMDFiZDciLCJpYXQiOjE3NjM1MDI0MjUsImV4cCI6MTc2NDEwNzIyNX0.bf0h-0Mq_FhlK7o31EgMbHoCEXGnqbeYv04vGYh82Oo",

"expires_at": "2025-11-25T21:47:05.522Z",

"ip_address": "::1",

"user_agent": "PostmanRuntime/7.49.1",

"created_at": "2025-11-18T21:47:05.523Z",

"createdAt": "2025-11-18T21:47:05.523Z",

"updatedAt": "2025-11-18T21:47:05.523Z",

"__v": 0

},

{

"_id": "691ce908ba685438e4301be9",

"user_id": "691ce344ba685438e4301bd7",

"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTFjZTM0NGJhNjg1NDM4ZTQzMDFiZDciLCJpYXQiOjE3NjM1MDIzNDQsImV4cCI6MTc2NDEwNzE0NH0.kkLureDkTEpKOCzTERQC8ZFyA9gMIWQrSsMDy08oUwI",

"expires_at": "2025-11-25T21:45:44.288Z",

"ip_address": "::1",

"user_agent": "PostmanRuntime/7.49.1",

"created_at": "2025-11-18T21:45:44.288Z",

"createdAt": "2025-11-18T21:45:44.289Z",

"updatedAt": "2025-11-18T21:45:44.289Z",

"__v": 0

},

{

"_id": "691ce46cba685438e4301bdc",

"user_id": "691ce344ba685438e4301bd7",

"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTFjZTM0NGJhNjg1NDM4ZTQzMDFiZDciLCJpYXQiOjE3NjM1MDExNjQsImV4cCI6MTc2NDEwNTk2NH0.9e0pydkdWoZJh88YqeOP31zaLtgovT1ZJ6bbazoQ8_o",

"expires_at": "2025-11-25T21:26:04.215Z",

"ip_address": "::1",

"user_agent": "PostmanRuntime/7.49.1",

"created_at": "2025-11-18T21:26:04.215Z",

"createdAt": "2025-11-18T21:26:04.216Z",

"updatedAt": "2025-11-18T21:26:04.216Z",

"__v": 0

}

],

"pagination": {

"total": 3,

"limit": 20,

"offset": 0

}

}
```

**Test Result**: ✅ **PASS**
**Notes**:
![[Pasted image 20251118135942.png]]

---

## 6. Validate Session

### f) Use Case: Check if a session is valid
**Resource(s)**: sessions
**HTTP Method**: GET
**Request URL**: `{{baseUrl}}/api/users/691ce344ba685438e4301bd7`

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Expected Response** (Status: 200 OK):
```json
{

"success": true,

"data": {

"_id": "691ce344ba685438e4301bd7",

"username": "testuser1",

"email": "newemail@example.com",

"role": "teller",

"status": "active",

"failed_login_attempts": 0,

"account_locked_until": null,

"created_at": "2025-11-18T21:21:08.592Z",

"createdAt": "2025-11-18T21:21:08.593Z",

"updatedAt": "2025-11-18T21:50:51.248Z",

"__v": 0,

"last_login": "2025-11-18T21:47:05.522Z",

"user_id": "691ce344ba685438e4301bd7",

"id": "691ce344ba685438e4301bd7"

}

}
```

**Test Result**: ✅ **PASS**
![[Pasted image 20251118140742.png]]

---

## 7. Logout (Delete Session)

### g) Use Case: Logout user by deleting session
**Resource(s)**: sessions
**HTTP Method**: DELETE
**Request URL**: `{{baseUrl}}/api/sessions/691ce344ba685438e4301bd7`

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Expected Response** (Status: 200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Test Result**: ✅ **PASS**
![[Pasted image 20251118140924.png]]


## 8. Delete Specific User Session (Sub-resource)

### h) Use Case: Delete a specific session for a user
**Resource(s)**: users/sessions
**HTTP Method**: DELETE
**Request URL**: {{baseUrl}}/api/users/691ce344ba685438e4301bd7/sessions/691ce908ba685438e4301be9

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Expected Response** (Status: 200 OK):
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

**Test Result**: ✅ **PASS**
![[Pasted image 20251118141135.png]]

---

## 9. Delete User Account

### i) Use Case: Delete user account permanently
**Resource(s)**: users
**HTTP Method**: DELETE
**Request URL**: `{{baseUrl}}/api/users/691ce344ba685438e4301bd7`

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Expected Response** (Status: 200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Test Result**: ✅ **PASS**
![[Pasted image 20251118141224.png]]

---

## 10. Get User Penalties (Sub-resource)

### j) Use Case: Retrieve healer penalty information
**Resource(s)**: users/penalties
**HTTP Method**: GET
**Request URL**: `{{baseUrl}}/api/users/{{userId}}/penalties`

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Expected Response** (Status: 200 OK):
```json
{

"success": true,

"data": null

}
```

**Test Result**: ✅ **PASS**
![[Pasted image 20251118141352.png]]

---

## 11. Create/Increment Penalty (Sub-resource - Admin Only)

### k) Use Case: Add penalty to healer for harmful content
**Resource(s)**: users/penalties
**HTTP Method**: POST
**Request URL**: `{{baseUrl}}/api/users/{{userId}}/penalties`

**Request Headers**:
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "reason": "Inappropriate response detected",
  "reply_id": "691cd456ba685438e4301d12"
}
```

**Expected Response** (Status: 201 Created):
```json
{

"success": true,

"data": {

"user_id": "691cd9dfba685438e4301bb9",

"harmful_count": 1,

"alert_sent": false,

"healer_status_removed": false,

"last_violation_at": "2025-11-18T22:15:12.037Z",

"_id": "691ceff0ba685438e4301c19",

"updated_at": "2025-11-18T22:15:12.040Z",

"createdAt": "2025-11-18T22:15:12.040Z",

"updatedAt": "2025-11-18T22:15:12.040Z",

"__v": 0,

"penalty_id": "691ceff0ba685438e4301c19",

"id": "691ceff0ba685438e4301c19"

}

}
```

**Test Result**: ⚠️ **REQUIRES ADMIN ROLE**
![[Pasted image 20251118141519.png]]

---

## 12. Reset Penalty (Sub-resource - Admin Only)

### l) Use Case: Reset healer penalties (forgiveness/appeal)
**Resource(s)**: users/penalties
**HTTP Method**: PATCH
**Request URL**: `{{baseUrl}}/api/users/{{userId}}/penalties`

**Request Headers**:
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body**: None (or optional reason)

**Expected Response** (Status: 200 OK):
```json
{

"success": true,

"data": {

"_id": "691ceff0ba685438e4301c19",

"user_id": "691cd9dfba685438e4301bb9",

"harmful_count": 0,

"alert_sent": false,

"healer_status_removed": false,

"last_violation_at": null,

"updated_at": "2025-11-18T22:16:02.613Z",

"createdAt": "2025-11-18T22:15:12.040Z",

"updatedAt": "2025-11-18T22:16:02.613Z",

"__v": 0,

"penalty_id": "691ceff0ba685438e4301c19",

"id": "691ceff0ba685438e4301c19"

}

}
```

**Test Result**: ⚠️ **REQUIRES ADMIN ROLE**
![[Pasted image 20251118141609.png]]

---

