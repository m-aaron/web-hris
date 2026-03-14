import { z } from "zod";

const hoursSchema = z.any()
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
    
export const trainingSchema = z.object({
    trainings: z.array(
        z.object({
            title: z.string().min(1, "Title is required"),
            place: z.string().min(1, "Place is required"),
            date_from: z.string().min(1, "Start date is required").refine((date) => {
                const today = new Date()
                const dateFrom = new Date(date)

                return dateFrom < today
                }, {
                message: "Start date cannot be in the future"
                }),

            date_to: z.string().optional(),
            hours: hoursSchema,
            conducted_by: z.string().optional(),
        })
        
        .superRefine((data, ctx) => {
            if (data.date_from && data.date_to && new Date(data.date_to) < new Date(data.date_from)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["date_to"],
                    message: "End date cannot be earlier than start date"
                });
            }
        })
    )
});