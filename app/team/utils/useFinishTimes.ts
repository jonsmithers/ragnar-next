import { useMemo } from 'react';
import useSWR from 'swr';
import z from 'zod';
import { fetcher } from './fetcher';

export function useFinishTimes(teamName: string) {
  const { data, ...result } = useSWR(
    `/api/team/${teamName}/finish-times`,
    fetcher
  );
  const finishTimes: FinishTimeState[] | undefined = useMemo(
    () => (data === undefined ? undefined : z.array(FinishTimeZodClient).parse(data)),
    [data]
  );
  return { ...result, finishTimes };
}

const FinishTimeZodClient = z.object({
  id: z.number().optional(),
  runnerId: z.number(),
  loopId: z.number(),
  finishTime: z
    .string()
    .or(z.date())
    .transform((s) => new Date(s)),
});
export type FinishTimeState = z.infer<typeof FinishTimeZodClient>;
