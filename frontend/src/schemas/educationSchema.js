import { z } from "zod"

const currentYear = new Date().getFullYear();

const yearSchema = z.preprocess((val) => {
    if (val === null || val === undefined) return "";
    return String(val).trim();
}, z.string().refine(val => {
    if (!val) return true; // optional, allow empty string
    if (!/^\d{4}$/.test(val)) return false;
    const year = parseInt(val, 10);
    return year >= 1900 && year <= currentYear;
}, { message: `Year must be between 1900 and ${currentYear}` }));

const educSchema = z
    .object({
        id: z.any().optional(),
        title: z.string().trim().optional(),
        school: z.string().trim().optional(),
        year_started: yearSchema,
        year_finished: yearSchema,

        majors: z.array(z.object({ id: z.any().optional(), name: z.string().trim().optional() })).optional(),
        minors: z.array(z.object({ id: z.any().optional(), name: z.string().trim().optional() })).optional(),
        honors: z.array(z.object({ id: z.any().optional(), name: z.string().trim().optional() })).optional(),
        scholarships: z.array(z.object({ id: z.any().optional(), name: z.string().trim().optional() })).optional(),
    })
    .superRefine((data, ctx) => {

        const hasNestedData =
            (data.majors && data.majors.some(item => item.name)) ||
            (data.minors && data.minors.some(item => item.name)) ||
            (data.honors && data.honors.some(item => item.name)) ||
            (data.scholarships && data.scholarships.some(item => item.name));

        const hasEducationData =
            data.title ||
            data.school ||
            data.year_started ||
            data.year_finished ||
            hasNestedData;

        if (hasEducationData) {

            if (!data.title) {
                ctx.addIssue({
                code: "custom",
                path: ["title"],
                message: "Title is required if education info is provided"
                })
            }

            if (!data.school) {
                ctx.addIssue({
                code: "custom",
                path: ["school"],
                message: "School is required if education info is provided"
                })
            }
        }

        if (data.year_started && data.year_finished && parseInt(data.year_finished) < parseInt(data.year_started)) {
            ctx.addIssue({
                code: "custom",
                path: ["year_finished"],
                message: "Finish year cannot be earlier than start year"
            });
        }
    });


export const educationSchema = z.object({
    education: z.array(educSchema)
})