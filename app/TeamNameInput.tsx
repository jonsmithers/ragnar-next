// import { Text } from '@chakra-ui/react';
import { Box, Button, Input } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconRun } from '@tabler/icons-react';
import { FC, useCallback, useState } from 'react';

export const TeamNameInput: FC<Record<string, unknown>> = () => {
  const [value, setValue] = useState('');
  // const [, setLocation] = useLocation();
  // const toast = useToast();
  const submit = useCallback(async () => {
    notifications.show({
      title: 'hi',
      message: 'a',
      icon: <IconCheck />,
    });
    await fetch('/api/team', {
      method: 'PATCH',
      body: JSON.stringify({ name: value }),
    });
    // toast({ title: 'todo', status: 'info' });
    // try {
    //   // await signInOrMakeTeamAccount(value);
    //   if (!await Team.existsByName(value)) {
    //     const newTeam = await Team.insert({name: value});
    //     console.log('newTeam', newTeam);
    //   }
    //   setLocation(`/team/${value}`);
    // } catch(e) {
    //   toast({
    //     title: 'Error 😕',
    //     status: 'error',
    //   });
    // }
  }, [value]);
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
    </Box>
  );
};
export default TeamNameInput;
