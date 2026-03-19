import { z } from "zod"
import { normalizeNullToEmptyString } from "./schemaNormalizers"

const childSchema = z
  .object({
    children_name: z.object({
      last_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
      first_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
      middle_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
      name_extension: z.preprocess(normalizeNullToEmptyString, z.string().optional())
    }),

    birth_date: z.preprocess(
      normalizeNullToEmptyString,
      z.string()
      .optional()
      .refine((date) => {
        if (!date) return true
        const today = new Date()
        const birth = new Date(date)
        return birth < today
      }, {
        message: "Birth date cannot be in the future"
      })
    ),

    office_school: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
    occupation: z.preprocess(normalizeNullToEmptyString, z.string().optional())
  })

  .superRefine((data, ctx) => {

    const name = data.children_name

    const hasChildName =
      name?.last_name ||
      name?.first_name ||
      name?.middle_name ||
      name?.name_extension;

    const hasOtherInfo =
      data.birth_date ||
      data.office_school ||
      data.occupation;

    if (hasChildName || hasOtherInfo) {

      if (!name?.last_name) {
        ctx.addIssue({
          code: "custom",
          path: ["children_name", "last_name"],
          message: "Last name is required if child info is provided"
        })
      }

      if (!name?.first_name) {
        ctx.addIssue({
          code: "custom",
          path: ["children_name", "first_name"],
          message: "First name is required if child info is provided"
        })
      }

    }

  })


export const childrenSchema = z.object({
  children: z.array(childSchema)
})