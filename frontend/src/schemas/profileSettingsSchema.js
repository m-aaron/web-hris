import { z } from "zod";

export const changeEmailSchema = z.object({
    newEmail: z.preprocess(
        (value) => String(value || "").trim().toLowerCase(),
        z
            .string()
            .min(1, "New email is required")
            .email("Invalid email format")
    ),
    currentPasswordForEmail: z.preprocess(
        (value) => String(value || ""),
        z
            .string()
            .min(1, "Current password is required")
            .min(8, "Current password must be at least 8 characters")
    ),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.preprocess(
            (value) => String(value || ""),
            z
                .string()
                .min(1, "Current password is required")
                .min(8, "Current password must be at least 8 characters")
        ),
        newPassword: z.preprocess(
            (value) => String(value || ""),
            z
                .string()
                .min(1, "New password is required")
                .min(8, "New password must be at least 8 characters")
        ),
        confirmPassword: z.preprocess(
            (value) => String(value || ""),
            z
                .string()
                .min(1, "Confirm password is required")
        ),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Confirm password must match new password",
        path: ["confirmPassword"],
    });
