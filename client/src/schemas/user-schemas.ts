import { minLength, z } from 'zod'

export const updateUserProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required.')
    .max(80, 'Full name must be between 1 and 80 characters.'),

  bio: z
    .string()
    .min(7, 'Bio must be atleast 7 characters.')
    .max(500, 'Bio cannot be longer than 500 characters.')
    .nullable()
    .optional(),
})
