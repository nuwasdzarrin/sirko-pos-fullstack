# Security Guidelines for Sirko POS Fullstack

This document provides security best practices tailored to the Sirko POS full-stack application (Bun + Elysia.js backend, SQLite + Drizzle ORM, Vue 3 + Pinia frontend). It aligns with core security principles—Security by Design, Least Privilege, Defense in Depth—and addresses specific implementation areas.

---

## 1. Security by Design

- Integrate security reviews at every milestone (design, implementation, testing, deployment).  
- Define threat models for authentication flows, transaction processing, reporting endpoints.  
- Mandate code reviews with a security checklist before merging.

## 2. Authentication & Access Control

### 2.1 Robust Authentication

- Use JWTs signed with a strong HMAC (e.g., HS256) or RSA/ECDSA algorithm—never `none`.  
- Store `JWT_SECRET` (or private keys) in a secure vault or environment variable (no hard-coding).  
- Enforce short token lifetimes (e.g., 15 min access, 7 d refresh).  

### 2.2 Password Security

- Require minimum length (≥ 12 chars), complexity, and rotation policies.  
- Hash passwords with Argon2 or bcrypt (unique salt per user).  
- Throttle failed login attempts (e.g., 5 tries per 15 min).  

### 2.3 Session & Token Management

- Validate `exp` and `nbf` claims on every request.  
- Reject tokens with invalid signatures or malformed payloads.  
- Provide logout endpoint to revoke refresh tokens (maintain a revocation list).  

### 2.4 Role‐Based Access Control (RBAC)

- Define roles (`owner`, `manager`, `cashier`) and map to permissions.  
- Implement Elysia middleware to extract the JWT, verify it, and attach `ctx.user` with role.  
- Enforce authorization checks at every protected route, e.g.:  
  - Only `manager` can adjust stock.  
  - Only `owner` can access profit reports.  

### 2.5 Multi‐Factor Authentication (Optional)

- For high‐privilege roles (`owner`), offer TOTP or SMS-based MFA.  
- Store MFA secrets encrypted at rest and require OTP verification upon login.

---

## 3. Input Handling & Processing

### 3.1 Validation & Sanitization

- Use Zod schemas in each Elysia route to validate `body`, `params`, and `query`.  
- Reject requests with unexpected or missing fields (fail securely with HTTP 400).  

### 3.2 Prevent Injection

- Leverage Drizzle ORM’s parameterized queries for all database access.  
- Never interpolate user input into raw SQL.  
- Validate numeric IDs, date ranges, and text fields against strict patterns.  

### 3.3 Cross‐Site Scripting (XSS)

- On the Vue client, escape or sanitize any user‐provided content before rendering.  
- Enable a strict Content Security Policy (CSP) in HTTP headers:  
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'sha256-...';
  ```  

### 3.4 Redirects & File Uploads

- If using dynamic redirects, validate URLs against a whitelist of trusted domains.  
- File uploads (e.g., product images):  
  - Allow only specific MIME types (PNG, JPEG).  
  - Scan for malware if possible.  
  - Store outside webroot or use presigned URLs on a storage service.  
  - Restrict file names (no path traversal).  

---

## 4. Data Protection & Privacy

### 4.1 Encryption in Transit

- Enforce HTTPS/TLS 1.2+ for all client↔server and server↔db communications (if remote).  
- Configure HSTS (`Strict-Transport-Security` header) on the Bun/Elysia server.

### 4.2 Encryption at Rest

- SQLite file: consider OS‐level encryption or SQLite Encryption Extension (SEE).  
- Encrypt backups before moving them off-site.

### 4.3 Secrets Management

- Store secrets (JWT keys, database paths) in environment variables or a secrets manager (Vault, AWS SM).  
- Do not commit `.env` with real values.  

### 4.4 Logging & Error Handling

- Log high‐level events (login success/failure, stock changes) with minimal PII.  
- On failures, return generic error messages (e.g., “Invalid credentials”)—no stack traces.  
- Protect log access with RBAC and rotate logs regularly.

---

## 5. API & Service Security

### 5.1 Rate Limiting & Throttling

- Apply IP‐based or user‐based rate limits on authentication and transaction endpoints.  
- Use an in‐memory store (Redis) or a Bun‐compatible plugin for throttling.

### 5.2 CORS Configuration

- Restrict allowed origins to your frontend domain(s).  
- Enable only required methods (`GET, POST, PUT, DELETE`) and headers (`Authorization, Content-Type`).

### 5.3 Versioning & HTTP Verbs

- Namespace APIs under `/api/v1/...`.  
- Use correct verbs: `GET` for reads, `POST` for creation, `PUT/PATCH` for updates, `DELETE` for removals.

### 5.4 Least Privilege on Services

- Database user: grant only necessary permissions (no DROP or ALTER in production).  
- Container user: run processes as non-root inside Docker.

---

## 6. Frontend Security Hygiene

### 6.1 Secure Storage of Tokens

- Avoid `localStorage` for JWT.  
- Prefer `HttpOnly`, `Secure`, `SameSite=Strict` cookies for the access token.  
- Protect CSRF with synchronizer tokens or double-submit cookie pattern.

### 6.2 Security Headers

- `X-Content-Type-Options: nosniff`  
- `X-Frame-Options: DENY`  
- `Referrer-Policy: no-referrer`  
- `Permissions-Policy` to limit browser features.

### 6.3 Subresource Integrity (SRI)

- If loading external scripts or styles (e.g., Bootstrap CDN), include integrity hashes.

### 6.4 Disable Debug in Production

- Remove verbose logs, Vue devtools hooks, and any debug flags in the production build.

---

## 7. Infrastructure & Configuration

### 7.1 Docker Hardening

- Use official, minimal Bun/Elysia and SQLite base images.  
- Multi-stage builds: final image contains only compiled assets and runtime.  
- Scan container images for vulnerabilities (Trivy, Clair).

### 7.2 Network & Firewall

- Expose only necessary ports (e.g., 443 for HTTPS).  
- Place database (SQLite file) outside the network boundary if remote; if shared, restrict directory permissions.

### 7.3 TLS & Cipher Suites

- Disable weak ciphers and protocols (SSLv3, TLS 1.0/1.1).  
- Enable strong cipher suites (AES GCM, ECDHE).  

### 7.4 Configuration Management

- Keep configurations in version control (excluding secrets).  
- Use environment-specific `.env` files with secure defaults.

---

## 8. Dependency Management

- Maintain a lockfile (`package-lock.json`).  
- Regularly run SCA tools to detect vulnerable dependencies.  
- Update Bun, Elysia, Vue, Drizzle ORM, Zod, and Bootstrap to patch versions promptly.  
- Avoid unnecessary packages—minimize attack surface.

---

## 9. DevOps & CI/CD Security

- Integrate SAST (ESLint security plugins), DAST (API fuzzing), and SCA into pipelines.  
- Store CI/CD tokens and secrets in a vault—grant pipelines least privilege.  
- Automate security and unit tests; require passing build and security checks for merge.

---

## 10. Continuous Improvement

- Schedule periodic security audits and penetration tests.  
- Monitor logs and metrics for anomalous activity.  
- Update threat model and run tabletop exercises after significant feature additions or changes.

By following these guidelines, Sirko will achieve a robust security posture, protect sensitive data, and build trust with users across all branches and roles.
