import { z } from "zod";
import { normalizeNullToEmptyString } from "./schemaNormalizers";

const nameSchema = z.preprocess(
    normalizeNullToEmptyString,
    z.string().min(1, "Name is required")
);

export const systemSettingsNameSchema = z.object({
    name: nameSchema,
});

export const systemSettingsWithDescriptionSchema = z.object({
    name: nameSchema,
    descriptions: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
});
