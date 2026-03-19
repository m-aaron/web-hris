import { z } from "zod"
import { normalizeNullToEmptyString } from "./schemaNormalizers"

export const personalSchema = z.object({
  // Basic Identity
  last_name: z.preprocess(
    normalizeNullToEmptyString,
    z.string().min(1, "Last name is required")
  ),
  first_name: z.preprocess(
    normalizeNullToEmptyString,
    z.string().min(1, "First name is required")
  ),
  middle_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
  name_extension: z.preprocess(normalizeNullToEmptyString, z.string().optional()),

  // Personal Details
  sex: z.preprocess(
    normalizeNullToEmptyString,
    z.string().min(1, "Sex is required")
  ),
  birth_date: z.preprocess(
    normalizeNullToEmptyString,
    z.string().min(1, "Birth date is required")
  ).refine((date) => {
      const today = new Date()
      const birth = new Date(date)

      return birth < today
    }, {
      message: "Birth date cannot be in the future"
    }),
  
  civil_status: z.preprocess(
    normalizeNullToEmptyString,
    z.string().min(1, "Civil status is required")
  ),
  citizenship: z.preprocess(
    normalizeNullToEmptyString,
    z.string().min(1, "Citizenship is required")
  ),
  religion: z.preprocess(
    normalizeNullToEmptyString,
    z.string().min(1, "Religion is required")
  ),
  blood_type: z.preprocess(normalizeNullToEmptyString, z.string().optional()),

  // Address
  address: z.object({
    house_no: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
    street: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
    barangay: z.preprocess(
      normalizeNullToEmptyString,
      z.string().min(1, "Barangay is required")
    ),
    city: z.preprocess(
      normalizeNullToEmptyString,
      z.string().min(1, "City is required")
    ),
    province: z.preprocess(
      normalizeNullToEmptyString,
      z.string().min(1, "Province is required")
    ),
    zip: z.preprocess(
      normalizeNullToEmptyString,
      z
        .string()
        .regex(/^\d{4}$/, "Invalid ZIP code")
        .optional()
        .or(z.literal(""))
    )
  }),

  // Contact
  email: z.preprocess(
    normalizeNullToEmptyString,
    z.string().optional().or(z.literal(""))
  ),
  contact_number: z.preprocess(
    normalizeNullToEmptyString,
    z
      .string()
      .regex(/^09\d{9}$/, "Invalid Philippine mobile number")
      .optional()
      .or(z.literal(""))
  )

});