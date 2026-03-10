import { z } from "zod"

export const personalSchema = z.object({
  // Basic Identity
  last_name: z.string().min(1, "Last name is required"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  name_extension: z.string().optional(),

  // Personal Details
  sex: z.string().min(1, "Sex is required"),
  birth_date: z.string().min(1, "Birth date is required").refine((date) => {
      const today = new Date()
      const birth = new Date(date)

      return birth < today
    }, {
      message: "Birth date cannot be in the future"
    }),
  
  civil_status: z.string().min(1, "Civil status is required"),
  citizenship: z.string().min(1, "Citizenship is required"),
  religion: z.string().min(1, "Religion is required"),
  blood_type: z.string().optional(),

  // Address
  address: z.object({
    house_no: z.string().optional(),
    street: z.string().optional(),
    barangay: z.string().min(1, "Barangay is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    zip: z
      .string()
      .regex(/^\d{4}$/, "Invalid ZIP code")
      .optional()
      .or(z.literal(""))
  }),

  // Contact
  email: z.string().optional().or(z.literal("")),
  contact_number: z
    .string()
    .regex(/^09\d{9}$/, "Invalid Philippine mobile number")
    .optional()
    .or(z.literal(""))

});