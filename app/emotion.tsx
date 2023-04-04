'use client';

import { CacheProvider } from '@emotion/react';
import { MantineProvider, useEmotionCache } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useServerInsertedHTML } from 'next/navigation';

// https://github.com/mantinedev/mantine-next-template/blob/next-13-app/app/emotion.tsx
export default function RootStyleRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const cache = useEmotionCache();
  cache.compat = true;

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(' '),
      }}
    />
  ));

  return (
    <CacheProvider value={cache}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: 'dark' }}
      >
        {children}
        <Notifications />
      </MantineProvider>
    </CacheProvider>
  );
}
