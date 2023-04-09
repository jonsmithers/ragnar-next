'use client';
import { Box, Button, Input, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircleFilled,
  IconConfetti,
  IconRun,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import z from 'zod';

const TeamCreateResponsesZod = z.enum(['created new team', 'already exists']);
export type TeamCreateResponses = z.infer<typeof TeamCreateResponsesZod>;

export const TeamNameInput: FC<Record<string, unknown>> = () => {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const submit = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/team', {
        method: 'PATCH',
        body: JSON.stringify({ name: value }),
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = TeamCreateResponsesZod.parse(await response.text());
      if (data === 'created new team') {
        notifications.show({
          icon: <IconConfetti />,
          title: 'New team!',
          message: '🏃 🏃 🏃',
        });
      }
      router.push(`/team/${value}`);
    } catch (e) {
      console.error(e);
      notifications.show({
        title: 'Crap 💩',
        message: (
          <>
            something broke
            <br />({String(e)})
          </>
        ),
        icon: <IconAlertCircleFilled />,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, value]);
  return (
    <Box display="flex" sx={{ gap: 8 }}>
      <Input value={value} onChange={(e) => setValue(e.target.value)}></Input>
      <Button
        disabled={!value}
        onClick={submit}
        variant="gradient"
        leftIcon={<IconRun />}
      >
        Go
      </Button>
      <LoadingOverlay visible={isLoading} />
    </Box>
  );
};
export default TeamNameInput;
