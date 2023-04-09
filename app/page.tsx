'use client';
import { Box, Paper, Text, Title } from '@mantine/core';
import { FC } from 'react';
import TeamNameInput from './TeamNameInput';

const Home: FC<{}> = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        placeItems: 'center',
        placeContent: 'center',
      }}
    >
      <Paper
        withBorder
        shadow="md"
        radius="md"
        p="lg"
        sx={{
          flexDirection: 'column',
          gap: 8,
          display: 'flex',
          placeItems: 'center',
        }}
      >
        <Title
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
        >
          Ragnar Pace Calculator
        </Title>
        <Text>To get started, enter your team name</Text>
        <TeamNameInput />
      </Paper>
    </Box>
  );
};
export default Home;
