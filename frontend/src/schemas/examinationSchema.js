import { z } from "zod";
import { normalizeNullToEmptyString } from "./schemaNormalizers";

export const examinationSchema = z.object({
    examinations: z.array(
        z.object({
        title: z.preprocess(normalizeNullToEmptyString, z.string().min(1, "Title is required")),
        date_taken: z.preprocess(normalizeNullToEmptyString, z.string().min(1, "Date taken is required")).refine((date) => {
            const today = new Date()
            const dateTaken = new Date(date)

            return dateTaken < today
            }, {
                message: "Date taken cannot be in the future"
            }),

        rating: z.preprocess(normalizeNullToEmptyString, z.string().optional()),
        })
    )
});