import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Visitor rate limiter - 1 chat per IP
export const visitorChatLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1,
  message: 'Visitors can only create one trial chat. Please register to continue chatting.',
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
});

// Visitor message limiter - 1 message per IP
export const visitorMessageLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1,
  message: 'Visitors can only send one trial message. Please register to continue.',
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
});

// Login attempt limiter
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

