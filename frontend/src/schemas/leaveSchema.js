import { z } from "zod";

const subjectSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    day: z.string().min(1, "Day is required"),
    time: z.string().min(1, "Time is required"),
    substitute_name: z.string().optional(),
});

const leaveTypeRow = z.object({
    leave_type_id: z.preprocess((v) => (v === null ? "" : String(v)), z.string().min(1, "Leave type is required")),
    date_from: z.string().min(1, "Date from is required"),
    date_to: z.string().min(1, "Date to is required"),
    number_of_days: z.preprocess((v) => Number(v), z.number().gt(0, "Number of days must be greater than 0")),
    other_leave_details: z.string().optional(),
});

export const leaveApplicationSchema = z.object({
    employee_id: z.string().min(1, "Employee is required"),
    date_filed: z.string().optional(),
    department_unit: z.string().optional(),
    substitute_name: z.string().optional(),
    subjects_covered: z.array(subjectSchema).optional(),
    reason: z.string().optional(),
    leave_types: z.array(leaveTypeRow).min(1, "At least one leave detail is required"),
});

// validate per-row constraints: date_to >= date_from
leaveApplicationSchema.superRefine((data, ctx) => {
    const rows = data.leave_types || [];
    rows.forEach((row, idx) => {
        if (row.date_from && row.date_to) {
            const from = new Date(row.date_from);
            const to = new Date(row.date_to);
            if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;
            if (to < from) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "End date must be after or equal to start date",
                    path: ["leave_types", idx, "date_to"],
                });
            }
        }
    });
});

export default leaveApplicationSchema;
// import { z } from "zod";
// import { normalizeNullToEmptyString } from "./schemaNormalizers";

// const numberOfDaysSchema = z.preprocess(
//     (value) => {
//         if (value === "" || value === null || value === undefined) return undefined;
//         const parsed = Number(value);
//         return Number.isNaN(parsed) ? value : parsed;
//     },
//     z
//         .number({ required_error: "Number of days is required" })
//         .positive("Number of days must be greater than 0")
// );

// export const leaveApplicationSchema = z
//     .object({
//         employee_id: z.preprocess(
//             normalizeNullToEmptyString,
//             z.string().min(1, "Employee is required")
//         ),
//         leave_type_id: z.preprocess(
//             normalizeNullToEmptyString,
//             z.string().min(1, "Leave type is required")
//         ),
//         date_filed: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
//         date_from: z.preprocess(
//             normalizeNullToEmptyString,
//             z.string().min(1, "Start date is required")
//         ),
//         date_to: z.preprocess(
//             normalizeNullToEmptyString,
//             z.string().min(1, "End date is required")
//         ),
//         number_of_days: numberOfDaysSchema,
//         reason: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
//     })
//     .refine(
//         (data) => {
//             if (!data.date_from || !data.date_to) return true;
//             return new Date(data.date_to) >= new Date(data.date_from);
//         },
//         {
//             message: "End date must be after or equal to start date",
//             path: ["date_to"],
//         }
//     );
