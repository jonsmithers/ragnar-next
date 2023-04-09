import { PaceCalculatorWithSuspense } from './PaceCalculator';
export default async function Page({
  params: { teamName },
}: {
  params: { teamName: string };
}) {
  return (
    <>
      <PaceCalculatorWithSuspense teamName={teamName} />
    </>
  );
}
