# Public API Security & Safety Checklist

This checklist ensures that your Node.js + Express + SQLite public API is secure, reliable, and maintainable.

---

## 1. Input Validation & Sanitization
- [ ] Validate all URL parameters (`id`, etc.)  
- [ ] Validate request bodies (`POST /generate`, etc.)  
- [ ] Limit string lengths (name, email, country)  
- [ ] Use a validation library like `Joi` or `express-validator`  
- [ ] Reject invalid data with `400 Bad Request`  

---

## 2. SQL / Database Safety
- [ ] Use prepared statements for all SQL queries  
- [ ] Avoid raw SQL interpolation  
- [ ] Ensure `email` has a unique constraint  
- [ ] Handle DB errors gracefully  
- [ ] Store DB file outside public folder  

---

## 3. Rate Limiting & Abuse Prevention
- [ ] Implement IP-based rate limiting (e.g., 20 requests/minute)  
- [ ] Limit batch operations if allowed (max 10 users per generate request)  
- [ ] Log excessive request attempts for monitoring  

---

## 4. CORS & Access Control
- [ ] Configure CORS headers (`Access-Control-Allow-Origin`)  
- [ ] Allow only trusted domains if frontend exists  
- [ ] Use `*` only with rate-limiting on fully public APIs  

---

## 5. Error Handling & Logging
- [ ] Catch all errors in controllers (try/catch → `next(err)`)  
- [ ] Global error handler returns `{ error: err.message }`  
- [ ] Do **not** expose stack traces to clients  
- [ ] Log server errors internally with timestamp, IP, request path  

---

## 6. Secrets & Environment Variables
- [ ] Use `.env` for PORT, DB_PATH, API_KEY, etc.  
- [ ] Never commit `.env` to GitHub  
- [ ] Never hardcode secrets in code  

---

## 7. Optional Authentication / API Key
- [ ] Generate an `API_KEY` in `.env`  
- [ ] Middleware to validate `x-api-key` header  
- [ ] Return `401 Unauthorized` if missing/invalid  

---

## 8. Data Safety & Constraints
- [ ] Limit age values (e.g., 18–75)  
- [ ] Ensure profile_pic URLs are valid  
- [ ] Prevent duplicate emails from generator  
- [ ] Enforce string/number type checks  

---

## 9. HTTPS & Deployment
- [ ] Serve API only via HTTPS  
- [ ] Use HTTPS redirects if necessary  
- [ ] Ensure environment variables are protected in cloud deployments  
- [ ] Set proper firewall / security rules  

---

## 10. Monitoring & Alerts
- [ ] Track number of `/generate` requests per IP  
- [ ] Monitor failed requests & validation errors  
- [ ] Alert if DB grows abnormally or error rates spike  
- [ ] Consider logging to a service (e.g., Papertrail, Loggly, or simple file logs)  

---

## 11. Optional Enhancements
- [ ] Helmet middleware for security headers  
- [ ] Compression middleware for performance  
- [ ] Cache GET requests if necessary  
- [ ] Implement pagination for `/api/users` if the DB grows  

---

> This checklist is meant to be a step-by-step guide to make your public API secure, maintainable, and reliable.