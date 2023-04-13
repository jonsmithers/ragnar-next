import { actualFinishTimes } from '@/app/db/schema';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const FinishTimeZod = createSelectSchema(actualFinishTimes).extend({
  finishTime: createSelectSchema(actualFinishTimes).shape.finishTime.transform(
    (t) => new Date(t)
  ),
});

export type FinishTime = z.infer<typeof FinishTimeZod>;
