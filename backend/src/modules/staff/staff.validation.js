const { z } = require("zod");

// Bcrypt supports a maximum of 72 password bytes
const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(72)
  .refine(
    (value) => Buffer.byteLength(value, "utf8") <= 72,
    "Password must not exceed 72 bytes"
  );

// Create a new staff account
const createStaffSchema = z.object({
  fullName: z.string().trim().min(2).max(100),

  email: z.email().trim().toLowerCase(),

  password: passwordSchema,

  phone: z.string().trim().max(30).optional().default(""),
}).strict();

// Update existing staff details
const updateStaffSchema = z.object({
  fullName: z.string().trim().min(2).max(100),

  email: z.email().trim().toLowerCase(),

  phone: z.string().trim().max(30),
}).strict();

// Activate or deactivate staff
const updateStaffStatusSchema = z.object({
  isActive: z.boolean(),
}).strict();

// Reset staff password
const resetStaffPasswordSchema = z.object({
  password: passwordSchema,
}).strict();

module.exports = {
  createStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
  resetStaffPasswordSchema,
};