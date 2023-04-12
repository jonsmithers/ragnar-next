import { useMemo } from 'react';
import useSWR from 'swr';
import z from 'zod';
import { fetcher } from './fetcher';

export function useFinishTimes(teamName: string) {
  const { data, ...result } = useSWR(
    `/api/team/${teamName}/finish-times`,
    fetcher
  );
  const finishTimes: FinishTime[] | undefined = useMemo(
    () => (data === undefined ? undefined : z.array(FinishTimeZod).parse(data)),
    [data]
  );
  return { ...result, finishTimes };
}

const FinishTimeZod = z.object({
  id: z.number(),
  runnerId: z.number(),
  loopId: z.number(),
  finishTime: z
    .string()
    .or(z.date())
    .transform((s) => new Date(s)),
});
export type FinishTime = z.infer<typeof FinishTimeZod>;
