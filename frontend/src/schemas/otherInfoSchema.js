import { z } from "zod";
import { normalizeNullToEmptyString } from "./schemaNormalizers";

const stringToBoolean = z.preprocess((val) => val === "true" || val === true, z.boolean())

export const otherInfoSchema = z.object({
    has_criminal_case: stringToBoolean,
    criminal_case_details: z.preprocess(normalizeNullToEmptyString, z.string().optional()),

    has_admin_offense: stringToBoolean,
    admin_offense_details: z.preprocess(normalizeNullToEmptyString, z.string().optional()),

    was_separated_employment: stringToBoolean,
    separation_details: z.preprocess(normalizeNullToEmptyString, z.string().optional())
}).superRefine((data, ctx) => {

    if (data.has_criminal_case && !data.criminal_case_details) {
        ctx.addIssue({
        code: "custom",
        path: ["criminal_case_details"],
        message: "Details are required when 'Yes' is selected"
        });
    }

    if (data.has_admin_offense && !data.admin_offense_details) {
        ctx.addIssue({
        code: "custom",
        path: ["admin_offense_details"],
        message: "Details are required when 'Yes' is selected"
        });
    }

    if (data.was_separated_employment && !data.separation_details) {
        ctx.addIssue({
        code: "custom",
        path: ["separation_details"],
        message: "Details are required when 'Yes' is selected"
        });
    }

});