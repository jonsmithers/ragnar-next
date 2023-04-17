import RootStyleRegistry from './emotion';
import './globals.css';

export const metadata = {
  title: 'Ragnar Pace Calculator',
  description: 'Estimate finish times for your ragnar team',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootStyleRegistry>
      <html lang="en">
        <body>{children}</body>
      </html>
    </RootStyleRegistry>
  );
}
