import type { TeamData } from '@/server-utils/TeamDataZod';
import { useMemo } from 'react';
import useSWR from 'swr';
import z from 'zod';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTeamData(teamName: string) {
  const { data, ...result } = useSWR<TeamData>(
    `/api/team/${teamName}`,
    fetcher
  );
  const teamData: TeamData | undefined = useMemo(
    () => (data === undefined ? undefined : TeamDataZodClient.parse(data)),
    [data]
  );
  return { ...result, teamData };
}

const TeamDataZodClient = z.object({
  id: z.number(),
  name: z.string(),
  startTime: z
    .string()
    .or(z.date())
    .transform((s) => new Date(s)),
  trailRunMultiplierLow: z.number(),
  trailRunMultiplierHigh: z.number(),
  runners: z.array(
    z.object({
      id: z.number(),
      teamId: z.number(),
      order: z.number(),
      name: z.string(),
      pace10k: z.string(),
    })
  ),
  loops: z.array(
    z.object({
      id: z.number(),
      teamId: z.number(),
      order: z.number(),
      name: z.string(),
      color: z.enum(['red', 'green', 'yellow']),
      lengthMiles: z.number(),
    })
  ),
});
