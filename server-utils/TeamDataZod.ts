import { loops, runners, teams } from '@/app/db/schema';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const TeamDataZod = createSelectSchema(teams).extend({
  startTime: createSelectSchema(teams).shape.startTime.transform(
    (t) => new Date(t)
  ),
  runners: z.array(createSelectSchema(runners)),
  loops: z.array(createSelectSchema(loops)),
  // actualFinishTimes: z.array(createSelectSchema(actualFinishTimes)),
});

export type TeamData = z.infer<typeof TeamDataZod>;
