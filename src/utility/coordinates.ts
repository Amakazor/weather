import {z} from "zod";

export const coordinates = z.object({
  latitude: z.number(),
  longitude: z.number(),
})

export type Coordinates = z.infer<typeof coordinates>