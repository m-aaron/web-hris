import { z } from "zod";

const referenceItemSchema = z
    .object({
            name: z.object({
                last_name: z.string().optional(),
                first_name: z.string().optional(),
                middle_name: z.string().optional(),
                name_extension: z.string().optional()
            }),

        address: z.object({
            house_no: z.string().optional(),
            street: z.string().optional(),
            barangay: z.string().optional(),
            city: z.string().optional(),
            province: z.string().optional(),
            zip: z
                .string()
                .regex(/^\d{4}$/, "Invalid ZIP code")
                .optional()
                .or(z.literal(""))
        }),

        contact_number: z
            .string()
            .regex(/^09\d{9}$/, "Invalid Philippine mobile number")
            .optional()
            .or(z.literal(""))
    })

    .superRefine((data, ctx) => {

        const name = data.name

        const hasChildName =
            name?.last_name ||
            name?.first_name ||
            name?.middle_name ||
            name?.name_extension;


        if (hasChildName) {

            if (!name?.last_name) {
                ctx.addIssue({
                code: "custom",
                path: ["name", "last_name"],
                message: "Last name is required if reference info is provided"
                })
            }

            if (!name?.first_name) {
                ctx.addIssue({
                code: "custom",
                path: ["name", "first_name"],
                message: "First name is required if reference info is provided"
                })
            }

        }

        const addr = data.address

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
                    path: ["address", "barangay"],
                    message: "Barangay is required"
                })
            }

            if (!addr?.city) {
                ctx.addIssue({
                    code: "custom",
                    path: ["address", "city"],
                    message: "City is required"
                })
            }

            if (!addr?.province) {
                ctx.addIssue({
                    code: "custom",
                    path: ["address", "province"],
                    message: "Province is required"
                })
            }

        }

    });


export const referenceSchema = z.object({
    references: z.array(referenceItemSchema)
});