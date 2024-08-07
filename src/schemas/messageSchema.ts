import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "content must be at least of 10 chracters" })
    .max(300, { message: "content must not exceed 300 chracters" }),
});
