const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const reviewSchema = z.object({
  review: z.string().min(1, 'Review cannot be empty'),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    req.validated = result.data;
    next();
  };
}

module.exports = { registerSchema, loginSchema, reviewSchema, validate };
