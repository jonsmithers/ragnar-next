import { PaceCalculatorWithSuspense } from './PaceCalculator';
export default async function Page({
  params: { teamName },
}: {
  params: { teamName: string };
}) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <PaceCalculatorWithSuspense teamName={teamName} />
      </div>
    </>
  );
}
