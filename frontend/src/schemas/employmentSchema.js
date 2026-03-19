import { z } from "zod"
import { normalizeNullToEmptyString, nullishToUndefined } from "./schemaNormalizers"

const workingHoursSchema = z.any()
    .refine(val => {
        // Allow empty/nullish values to pass, as it's optional.
        if (val === null || val === undefined || val === '') return true;
        // For non-empty values, check if it's a valid number representation.
        return !isNaN(Number(val));
    }, {
        message: "Must be a number.",
    })
    .refine(val => {
        if (val === null || val === undefined || val === '') return true;
        return Number.isInteger(Number(val));
    }, {
        message: "Must be a whole number.",
    })
    .refine(val => {
        if (val === null || val === undefined || val === '') return true;
        return Number(val) > 0;
    }, {
        message: "Must be a positive number.",
    })
    // After validation, transform to a number or undefined.
    .transform(val => (val === null || val === undefined || val === '') ? undefined : Number(val));


export const employmentSchema = z
    .object({
        date_hired: z.preprocess(
            normalizeNullToEmptyString,
            z.string().min(1, "Date hired is required")
        ).refine((date) => {
            const today = new Date()
            const dateHired = new Date(date)

            return dateHired < today
            }, {
                message: "Date hired cannot be in the future"
            }),
    
        position_id: z.coerce.number().min(1, "Position is required"),
        designation_id: z.preprocess(nullishToUndefined, z.coerce.number().optional()),
    
        sss: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
        pagibig: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
        tax: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
        philhealth: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
        peraa: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
    
        employment_status: z.preprocess(
            normalizeNullToEmptyString,
            z.string().min(1, "Employment status is required")
        ),
        employment_basis: z.preprocess(
            normalizeNullToEmptyString,
            z.string().min(1, "Employment basis is required")
        ),
    
        official_working_hours: workingHoursSchema,
        other_employment: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
        other_employment_working_hours: workingHoursSchema,
    })
    .superRefine((data, ctx) => {
        if (data.other_employment && !data.other_employment_working_hours) {
        ctx.addIssue({
            code: "custom",
            path: ["other_employment_working_hours"],
            message: "Working hours are required if other employment is specified.",
        });
        }
    });