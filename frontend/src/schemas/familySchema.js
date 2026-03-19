import { z } from "zod"
import { normalizeNullToEmptyString } from "./schemaNormalizers"

export const familySchema = z
    .object({
        spouse: z.object({
            last_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            first_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            middle_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            name_extension: z.preprocess(normalizeNullToEmptyString, z.string().optional())
        }),

        spouse_occupation: z.preprocess(normalizeNullToEmptyString, z.string().optional()),

        nearest_kin_name: z.object({
            last_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            first_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            middle_name: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            name_extension: z.preprocess(normalizeNullToEmptyString, z.string().optional())
        }),

        nearest_kin_address: z.object({
            house_no: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            street: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            barangay: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            city: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            province: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
            zip: z.preprocess(
                normalizeNullToEmptyString,
                z
                    .string()
                    .regex(/^\d{4}$/, "Invalid ZIP code")
                    .optional()
                    .or(z.literal(""))
            )
        }),

        nearest_kin_contact_number: z.preprocess(
            normalizeNullToEmptyString,
            z
                .string()
                .regex(/^09\d{9}$/, "Invalid Philippine mobile number")
                .optional()
                .or(z.literal(""))
        )
        })

        .superRefine((data, ctx) => {

        const spouse = data.spouse

        const hasSpouseData =
            spouse?.last_name ||
            spouse?.first_name ||
            spouse?.middle_name ||
            spouse?.name_extension

        if (hasSpouseData) {

            if (!spouse?.last_name) {
            ctx.addIssue({
                code: "custom",
                path: ["spouse", "last_name"],
                message: "Last name is required if spouse info is provided"
            })
            }

            if (!spouse?.first_name) {
            ctx.addIssue({
                code: "custom",
                path: ["spouse", "first_name"],
                message: "First name is required if spouse info is provided"
            })
            }

        }

        const kin = data.nearest_kin_name

        const hasKinData =
            kin?.last_name ||
            kin?.first_name ||
            kin?.middle_name ||
            kin?.name_extension

        if (hasKinData) {

            if (!kin?.last_name) {
            ctx.addIssue({
                code: "custom",
                path: ["nearest_kin_name", "last_name"],
                message: "Last name is required"
            })
            }

            if (!kin?.first_name) {
            ctx.addIssue({
                code: "custom",
                path: ["nearest_kin_name", "first_name"],
                message: "First name is required"
            })
            }

        }

        const addr = data.nearest_kin_address

        const hasAddress =
            addr?.house_no ||
            addr?.street ||
            addr?.barangay ||
            addr?.city ||
            addr?.province ||
            addr?.zip

        if (hasAddress) {

            if (!addr?.barangay) {
            ctx.addIssue({
                code: "custom",
                path: ["nearest_kin_address", "barangay"],
                message: "Barangay is required"
            })
            }

            if (!addr?.city) {
            ctx.addIssue({
                code: "custom",
                path: ["nearest_kin_address", "city"],
                message: "City is required"
            })
            }

            if (!addr?.province) {
            ctx.addIssue({
                code: "custom",
                path: ["nearest_kin_address", "province"],
                message: "Province is required"
            })
        }

    }

})