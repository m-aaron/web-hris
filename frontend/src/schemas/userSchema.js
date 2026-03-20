import { z } from "zod";
import { normalizeNullToEmptyString } from "./schemaNormalizers";
import { ROLES } from "../constants/employeeConstant";

const roleSchema = z.enum([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE], {
    errorMap: () => ({ message: "Role is required" }),
});

export const createUserSchema = z.object({
    email: z.preprocess(
        normalizeNullToEmptyString,
        z
            .string()
            .min(1, "Email is required")
            .email("Invalid email format")
    ),
    password: z.preprocess(
        normalizeNullToEmptyString,
        z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters")
    ),
    role: roleSchema,
    employeeId: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
});

export const editUserSchema = z.object({
    email: z.preprocess(
        normalizeNullToEmptyString,
        z
            .string()
            .min(1, "Email is required")
            .email("Invalid email format")
    ),
    role: roleSchema,
    employeeId: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
});
