1. What does bcrypt do and why don't we store plain passwords?
The Problem
Imagine your database gets hacked. If passwords are stored as plain text:
email: ahmed@gmail.com
password: mypassword123   ← hacker sees this immediately
The hacker now has everyone's password. And since people reuse passwords, they can access their Gmail, Facebook, bank accounts too.
The Solution — Hashing
A hash is a one-way transformation. You put a password in, you get a random-looking string out:
"mypassword123"  →  "$2b$10$Xk9mN2pL8qR..."
One-way means:

✅ You can turn mypassword123 → $2b$10$Xk9mN2pL8qR...
❌ You CANNOT turn $2b$10$Xk9mN2pL8qR... back to mypassword123

How Login Works Then?
User types:     "mypassword123"
bcrypt hashes:  "mypassword123" → "$2b$10$Xk9mN2pL8qR..."
Compare with DB: "$2b$10$Xk9mN2pL8qR..." === "$2b$10$Xk9mN2pL8qR..." ✅
bcrypt hashes the input the same way every time and compares — it never needs to "decode" anything.
What's the "salt"?
bcrypt adds a random string (called a salt) before hashing:
"mypassword123" + random salt → unique hash
This means even if two users have the same password, their hashes are different. Hackers can't use pre-computed tables (rainbow tables) to crack them.
Summary: bcrypt turns passwords into irreversible hashes. Even if the database is stolen, passwords are safe.

2. What are the 3 parts of a JWT token?
A JWT looks like this:
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyJ9.abc123xyz
3 parts separated by dots:
Part 1 — Header
eyJhbGciOiJIUzI1NiJ9
Decoded it's just:
json{ "alg": "HS256", "typ": "JWT" }
```
Just says "this is a JWT and we used HS256 algorithm to sign it."

### Part 2 — Payload
```
eyJpZCI6IjEyMyJ9
Decoded it's the actual data:
json{
  "id": "123",
  "email": "ahmed@gmail.com",
  "role": "USER",
  "exp": 1234567890
}
```
This is called **claims** — information about the user. `exp` is the expiry timestamp.

⚠️ **Important:** The payload is NOT encrypted — anyone can decode it. Never put sensitive data (passwords, credit cards) in a JWT.

### Part 3 — Signature
```
abc123xyz
```
This is created like this:
```
signature = HMAC_SHA256(
  base64(header) + "." + base64(payload),
  JWT_SECRET
)
```
The signature **locks** the token. If anyone changes even one character in the payload, the signature breaks and the backend rejects it.

### Real World Flow
```
Backend creates token:
  payload = { id: "123", role: "USER" }
  signs it with JWT_SECRET = "mysecret"
  → sends token to frontend

Frontend stores token and sends it with every request

Backend receives token:
  → verifies signature using JWT_SECRET
  → checks expiry
  → if both pass → trusts the payload
  → sets req.user = { id: "123", role: "USER" }
```

**Summary:** Header = metadata, Payload = user data, Signature = tamper-proof seal.

---

## 3. What does the authenticate middleware do?

Think of your API like a building. Some rooms are public (login, register). Some rooms need a key card (protected routes).

The `authenticate` middleware **is the key card scanner** at the door.

Here's exactly what it does step by step:
```
Request comes in
       ↓
1. Check Authorization header exists?
   → No?  → Stop. Send 401 "No token provided"
   → Yes? → Continue
       ↓
2. Extract token (remove "Bearer " prefix)
       ↓
3. jwt.verify(token, JWT_SECRET)
   → Invalid signature? → Stop. Send 401 "Invalid token"
   → Expired?          → Stop. Send 401 "Invalid token"
   → Valid?            → Continue
       ↓
4. Attach decoded user to req.user
       ↓
5. Call next() → route handler runs
In code terms, when you write:
typescriptrouter.get("/me", authenticate, getMe);
```
It means: **"run authenticate first, if it calls next() then run getMe"**

Without `authenticate`, anyone could access `/me` without being logged in.

**Summary:** authenticate is a gatekeeper that checks the JWT token before allowing access to protected routes.

---

## 4. What's the difference between 401 and 403?

These are both "you can't access this" errors but for different reasons.

### 401 — Unauthorized
**"I don't know who you are"**

You haven't proven your identity yet.
```
Examples:
- No token sent with request
- Token is expired
- Token signature is invalid
```
It's like trying to enter a building without showing your ID at all. The guard says: *"Who are you? Show me your ID first."*

### 403 — Forbidden
**"I know who you are, but you're not allowed here"**

You're authenticated but don't have permission.
```
Examples:
- USER trying to access /admin dashboard
- PROVIDER trying to delete another provider's data
- Regular user trying to approve providers
```
It's like showing your ID but the guard says: *"I know you're Ahmed, but this room is for admins only."*

### Simple Rule
```
401 = "Please log in first"
403 = "You're logged in but you don't have permission"
In our middleware:
typescript// 401 — not authenticated
if (!token) → 401

// 403 — authenticated but wrong role
if (user.role !== "ADMIN") → 403

Summary Table
ConceptOne LinebcryptTurns passwords into irreversible hashes so stolen DBs are uselessJWT HeaderMetadata about the token type and algorithmJWT PayloadThe actual user data (id, role, expiry)JWT SignatureTamper-proof seal using your secret keyauthenticateMiddleware that verifies JWT before allowing route access401Not logged in403Logged in but no permission