import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email().max(160),
  // Passwords are opaque credentials. Do not trim, normalize, change case or transform them.
  password: z.string().min(1).max(256),
});
