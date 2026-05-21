import { z } from "zod";

export const createFacultySchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  department_id: z.string().min(1, "Department is required"),
  teaching_load: z.string().optional(),
});

export const updateFacultySchema = z.object({
  department_id: z.string().min(1, "Department is required"),
  teaching_load: z.string().optional(),
});
