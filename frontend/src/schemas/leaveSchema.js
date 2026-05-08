import { z } from "zod";
import { normalizeNullToEmptyString } from "./schemaNormalizers";

const numberOfDaysSchema = z.preprocess(
    (value) => {
        if (value === "" || value === null || value === undefined) return undefined;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? value : parsed;
    },
    z
        .number({ required_error: "Number of days is required" })
        .positive("Number of days must be greater than 0")
);

export const leaveApplicationSchema = z
    .object({
        employee_id: z.preprocess(
            normalizeNullToEmptyString,
            z.string().min(1, "Employee is required")
        ),
        leave_type_id: z.preprocess(
            normalizeNullToEmptyString,
            z.string().min(1, "Leave type is required")
        ),
        date_filed: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
        date_from: z.preprocess(
            normalizeNullToEmptyString,
            z.string().min(1, "Start date is required")
        ),
        date_to: z.preprocess(
            normalizeNullToEmptyString,
            z.string().min(1, "End date is required")
        ),
        number_of_days: numberOfDaysSchema,
        reason: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
    })
    .refine(
        (data) => {
            if (!data.date_from || !data.date_to) return true;
            return new Date(data.date_to) >= new Date(data.date_from);
        },
        {
            message: "End date must be after or equal to start date",
            path: ["date_to"],
        }
    );
