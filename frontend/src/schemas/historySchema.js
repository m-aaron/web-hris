import { z } from "zod";

const salarySchema = z
    .any()
    .refine((val) => {
        if (val === null || val === undefined || val === "") return true;
        return !isNaN(Number(val));
    }, { message: "Salary must be a number." })
    .refine((val) => {
        if (val === null || val === undefined || val === "") return true;
        return Number(val) >= 0;
    }, { message: "Salary must be positive." })
    .transform((val) =>
        val === null || val === undefined || val === ""
        ? undefined
        : Number(val)
);

export const historySchema = z.object({
    history: z.array(
        z
        .object({
            start_date: z
            .string()
            .min(1, "Start date is required")
            .refine((date) => {
                const today = new Date();
                const start = new Date(date);
                return start <= today;
            }, { message: "Start date cannot be in the future" }),

            end_date: z.string().optional(),

            position: z.string().min(1, "Position is required"),

            employer: z.string().min(1, "Employer is required"),

            salary: salarySchema,

            reason_for_leaving: z.string().optional(),
        })
        .superRefine((data, ctx) => {
            if (
            data.start_date &&
            data.end_date &&
            new Date(data.end_date) < new Date(data.start_date)
            ) {
            ctx.addIssue({
                code: "custom",
                path: ["end_date"],
                message: "End date cannot be earlier than start date",
            });
            }
        })
    ),
});