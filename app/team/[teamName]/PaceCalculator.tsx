'use client';
import { TeamReactState, converters } from '@/app/date-utils';
import type { TeamData } from '@/server-utils/TeamDataZod';
import {
  Accordion,
  ActionIcon,
  Badge,
  Box,
  CloseButton,
  Group,
  Input,
  Loader,
  LoadingOverlay,
  Paper,
  Table,
  Transition,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircleFilled,
  IconArrowDown,
  IconArrowUp,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import { Duration } from 'dayjs/plugin/duration';
import { FC, Suspense, useEffect, useMemo, useState } from 'react';
import { PatternFormat, PatternFormatProps } from 'react-number-format';
import { useImmer } from 'use-immer';
import { useOnDebounce } from '../utils/useDebounce';
import { FinishTimeState, useFinishTimes } from '../utils/useFinishTimes';
import { useTeamData } from '../utils/useTeamData';

const DurationInput = (props: Omit<PatternFormatProps, 'format'>) => {
  return (
    <PatternFormat
      {...props}
      format="##:##"
      placeholder="mm:ss"
      isAllowed={({ value }) => {
        const minutesString = value.slice(0, 2);
        if (Number(minutesString) > 24) {
          return false;
        }
        const secondsString = value.slice(2);
        if (secondsString.length == 2 && Number(secondsString) > 59) {
          return false;
        }
        return true;
      }}
      mask={'-'}
      type="tel"
    />
  );
};

interface PaceCalculatorProps {
  teamName: string;
}

const PaceCalculator: FC<{
  teamData: TeamData;
  finishTimes: FinishTimeState[];
}> = ({ teamData: teamServerData, finishTimes: finishTimesServerData }) => {
  const [finishTimes, updateFinishTimes] = useImmer<
    PartialBy<FinishTimeState, 'id'>[]
  >(finishTimesServerData);
  const [data, updateData] = useImmer(() =>
    converters.teamDbData.toReactState(teamServerData)
  );
  const [initialData] = useState(data);
  const [initialFinishTimes] = useState(finishTimes);
  const { mutate: mutateTeamData } = useTeamData(teamServerData.name);
  const { mutate: mutateFinishTimes } = useFinishTimes(teamServerData.name);

  const [isSaving, setIsSaving] = useState(false);

  const { isDebouncing: isDebouncingFinishTimes } = useOnDebounce(
    finishTimes,
    () => {
      if (finishTimes === initialFinishTimes) {
        return;
      }
      setIsSaving(true);
      (async () => {
        try {
          const r = await fetch(`/api/team/${data.name}/finish-times`, {
            method: 'POST',
            body: JSON.stringify(finishTimes),
          });
          if (!r.ok) {
            throw new Error(r.statusText);
          }
          mutateFinishTimes(finishTimes);
        } catch (e) {
          console.error(e);
          notifications.show({
            title: 'Crap 💩',
            message: (
              <>
                Unable to save
                <br />({String(e)})
              </>
            ),
            icon: <IconAlertCircleFilled />,
            color: 'red',
          });
        } finally {
          setIsSaving(false);
        }
      })();
    },
    1000
  );
  const { isDebouncing: isDebouncingData } = useOnDebounce(
    data,
    () => {
      if (data === initialData) {
        return;
      }
      setIsSaving(true);
      (async () => {
        const dbData = converters.teamReactState.toDbData(data);
        try {
          const r = await fetch(`/api/team/${data.name}`, {
            method: 'POST',
            body: JSON.stringify(dbData),
          });
          if (!r.ok) {
            throw new Error(r.statusText);
          }
          mutateTeamData(dbData);
        } catch (e) {
          console.error(e);
          notifications.show({
            title: 'Crap 💩',
            message: (
              <>
                Unable to save
                <br />({String(e)})
              </>
            ),
            icon: <IconAlertCircleFilled />,
            color: 'red',
          });
        } finally {
          setIsSaving(false);
        }
      })();
    },
    1000
  );

  const showSavingIndicator = useMemo(
    () =>
      isSaving ||
      (isDebouncingData && data !== initialData) ||
      (isDebouncingFinishTimes && finishTimes !== initialFinishTimes),
    [
      data,
      finishTimes,
      initialData,
      initialFinishTimes,
      isDebouncingData,
      isDebouncingFinishTimes,
      isSaving,
    ]
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '800px',
      }}
    >
      <Transition
        mounted={showSavingIndicator}
        transition="fade"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => {
          return (
            <Paper
              style={styles}
              sx={{
                position: 'fixed',
                top: 8,
                right: 8,
                padding: 8,
                gap: 8,
                display: 'flex',
              }}
              shadow="lg"
              withBorder
            >
              <IconDeviceFloppy />
              <Loader size={'sm'} />
            </Paper>
          );
        }}
      </Transition>
      <Accordion defaultValue={'Estimated Start/Finish Times'}>
        <Accordion.Item value="runners">
          <Accordion.Control>Runners</Accordion.Control>
          <Accordion.Panel pb={4}>
            <TimeInput
              label="Team Start Time"
              max="18:00"
              defaultValue={useMemo(
                () => converters.dayjs.toHhmmString(data.startTime),
                [data.startTime]
              )}
              onChange={(e) => {
                updateData((data) => {
                  data.startTime = converters.hhmmString.toDayJS(
                    e.target.value
                  );
                });
              }}
            />
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>10k pace (minutes per mile)</th>
                  <th>Move</th>
                </tr>
              </thead>
              <tbody>
                {data.runners.map((runner, index) => (
                  <tr key={runner.id}>
                    <td>{index + 1}</td>
                    <td>
                      <Input
                        size="sm"
                        value={runner.name}
                        onChange={(event) => {
                          updateData((draft) => {
                            draft.runners[index].name = event.target.value;
                          });
                        }}
                      />
                    </td>
                    <td>
                      <Input
                        size="sm"
                        component={DurationInput}
                        defaultValue={runner.pace10k}
                        onValueChange={({ formattedValue }) => {
                          if (!formattedValue || formattedValue.includes('-')) {
                            return;
                          }
                          updateData((data) => {
                            data.runners[index].pace10k = formattedValue;
                          });
                        }}
                      />
                    </td>
                    <td>
                      <Group
                        sx={{
                          gap: 0,
                          '& > *:not(:last-child)': {
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                          },
                          '& > *:not(:first-child)': {
                            borderLeft: 0,
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                          },
                        }}
                      >
                        <ActionIcon
                          size={'lg'}
                          variant="default"
                          disabled={index === 0}
                          onClick={() => {
                            updateData((data) => {
                              data.runners[index - 1].order++;
                              data.runners[index].order--;
                              moveUp(data.runners, index);
                            });
                          }}
                        >
                          <IconArrowUp />
                        </ActionIcon>
                        <ActionIcon
                          size={'lg'}
                          variant="default"
                          disabled={index === data.runners.length - 1}
                          onClick={() => {
                            updateData((data) => {
                              data.runners[index].order++;
                              data.runners[index + 1].order--;
                              moveDown(data.runners, index);
                            });
                          }}
                        >
                          <IconArrowDown />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value={'Loops'}>
          <Accordion.Control>Loops</Accordion.Control>
          <Accordion.Panel pb={4}>
            <Table>
              <thead>
                <tr>
                  <th>Loop</th>
                  <th>Length (miles)</th>
                </tr>
              </thead>
              <tbody>
                {data.loops.map((loop, index) => (
                  <tr key={index}>
                    <td>
                      <Input
                        value={loop.name}
                        onChange={(event) => {
                          updateData((draft) => {
                            draft.loops[index].name = event.target.value;
                          });
                        }}
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        defaultValue={data.loops[index].lengthMiles}
                        onChange={(event) => {
                          updateData((data) => {
                            data.loops[index].lengthMiles = Number(
                              event.target.value
                            );
                          });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value={'Pace Calculator'}>
          <Accordion.Control>Pace Calculator</Accordion.Control>
          <Accordion.Panel pb={4}>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Estimated Trail Pace (minutes per mile)</th>
                </tr>
              </thead>
              <tbody>
                {data.runners.map((runner) => (
                  <tr key={runner.id}>
                    <td>{runner.name}</td>
                    <td>
                      {converters.mmssString.applyMultiplier(
                        runner.pace10k,
                        data.trailRunMultiplierLow
                      )}
                      -
                      {converters.mmssString.applyMultiplier(
                        runner.pace10k,
                        data.trailRunMultiplierHigh
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value={'Estimated Start/Finish Times'}>
          <Accordion.Control>Estimated Start/Finish Times</Accordion.Control>
          <Accordion.Panel pb={4}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table
                sx={(theme) => ({
                  '& td, & th': { whiteSpace: 'nowrap' },
                  // '& .loop-color-red': {
                  //   background: 'rgb(201,42,42, 0.3)', // theme.colors.red[9],
                  // },
                  // '& .loop-color-green': {
                  //   background: 'rgb(43, 138, 62, 0.3)', // theme.colors.green[9],
                  // },
                  // '& .loop-color-yellow': {
                  //   background: 'rgb(230,119,0, 0.3)', // theme.colors.yellow[9],
                  // },
                })}
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Loop</th>
                    <th>Runner</th>
                    <th>Estimated Finish Time</th>
                    <th>Actual Finish Time</th>
                  </tr>
                </thead>
                <tbody>
                  {useMemo(
                    () => computeFinishTimesTable(data, finishTimes),
                    [data, finishTimes]
                  ).map((finishTimeData, index) => (
                    <tr
                      key={index}
                      className={`loop-color-${finishTimeData.loop.color}`}
                    >
                      <td>{index + 1}</td>
                      <td>
                        <Badge color={finishTimeData.loop.color} variant="filled">
                          {finishTimeData.loop.name}
                        </Badge>
                      </td>
                      <td>{finishTimeData.runner.name}</td>
                      <td>
                        {converters.dayjs.toHuman(
                          finishTimeData.estimatedLoopFinishLow
                        )}
                        {` - `}
                        {converters.dayjs.toHuman(
                          finishTimeData.estimatedLoopFinishHigh
                        )}
                      </td>
                      <td>
                        <Group sx={{ gap: 1 }}>
                          <TimeInput
                            min={converters.dayjs.toHhmmString(
                              finishTimeData.minimumAllowedFinishTime
                            )}
                            value={converters.date.toHhmmString(
                              finishTimes.find(
                                ({ runnerId, loopId }) =>
                                  loopId === finishTimeData.loop.id &&
                                  runnerId === finishTimeData.runner.id
                              )?.finishTime
                            )}
                            onChange={(e) => {
                              const newTime = converters.hhmmString.toDate(
                                e.target.value
                              );
                              updateFinishTimes((finishTimes) => {
                                const actualFinishTime = finishTimes.find(
                                  ({ runnerId, loopId }) =>
                                    loopId === finishTimeData.loop.id &&
                                    runnerId === finishTimeData.runner.id
                                );
                                if (actualFinishTime) {
                                  actualFinishTime.finishTime = newTime;
                                } else {
                                  finishTimes.push({
                                    id: undefined, // im here NOT DONE HERE
                                    runnerId: finishTimeData.runner.id,
                                    loopId: finishTimeData.loop.id,
                                    finishTime: newTime,
                                  });
                                }
                              });
                            }}
                            rightSection={
                              <CloseButton
                                variant="light"
                                disabled={
                                  !Boolean(
                                    finishTimes.find(
                                      ({ runnerId, loopId }) =>
                                        loopId === finishTimeData.loop.id &&
                                        runnerId === finishTimeData.runner.id
                                    )
                                  )
                                }
                                onClick={() => {
                                  updateFinishTimes((finishTimes) => {
                                    const index = finishTimes.findIndex(
                                      ({ runnerId, loopId }) =>
                                        runnerId === finishTimeData.runner.id &&
                                        loopId == finishTimeData.loop.id
                                    );
                                    finishTimes.splice(index, 1);
                                  });
                                }}
                                size="sm"
                              />
                            }
                          />
                        </Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
};

function moveUp<T>(a: T[], index: number) {
  a.splice(index - 1, 0, ...a.splice(index, 1));
}
function moveDown<T>(a: T[], index: number) {
  a.splice(index + 1, 0, ...a.splice(index, 1));
}

//       <TableContainer>
//         <Table size="sm">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Loop</th>
//               <th>Runner</th>
//               <th>Estimated Finish Time</th>
//               <th>Actual Finish Time</th>
//             </tr>
//           </thead>
//           <tbody>
//             {useMemo(() => computeFinishTimesTable(data), [data]).map(
//               (finishTimeData, index) => (
//                 <tr key={index} className={css`
//                   background: ${COLOR_MAP[colorMode]?.[finishTimeData.loop.name]};
//                   background: ${chakraTheme.colors[finishTimeData.loop.name as keyof Theme['colors']][colorMode === 'dark' ? 800 : 100]};
//                 `}>
//                   <td>{index + 1}</td>
//                   <td>{finishTimeData.loop.name}</td>
//                   <td>{finishTimeData.runner.name}</td>
//                   <td>
//                     {converters.dateTime.toHuman(
//                       finishTimeData.estimatedLoopFinishLow
//                     )}
//                     -
//                     {converters.dateTime.toHuman(
//                       finishTimeData.estimatedLoopFinishHigh
//                     )}
//                   </td>
//                   <td>
//                     <CustomTimeField
//                       minValue={finishTimeData.minimumAllowedFinishTime}
//                       value={
//                         data.actualFinishTimes.find(
//                           ({ runnerName, loopName }) =>
//                             loopName === finishTimeData.loop.name &&
//                             runnerName === finishTimeData.runner.name
//                         )?.finishTime
//                       }
//                       onClear={() => {
//                         updateData((data) => {
//                           const index = data.actualFinishTimes.findIndex(
//                             ({ runnerName, loopName }) =>
//                               loopName === finishTimeData.loop.name &&
//                               runnerName === finishTimeData.runner.name
//                           );
//                           data.actualFinishTimes.splice(index, 1);
//                         });
//                       }}
//                       onChange={(newTime) => {
//                         updateData((data) => {
//                           const actualFinishTime =
//                             data.actualFinishTimes.find(
//                               ({ runnerName, loopName }) =>
//                                 loopName === finishTimeData.loop.name &&
//                                 runnerName === finishTimeData.runner.name
//                             );
//                           if (actualFinishTime) {
//                             actualFinishTime.finishTime = newTime;
//                           } else {
//                             data.actualFinishTimes.push({
//                               runnerName: finishTimeData.runner.name,
//                               loopName: finishTimeData.loop.name,
//                               finishTime: newTime,
//                             });
//                           }
//                         });
//                       }}
//                     />
//                   </td>
//                 </tr>
//               )
//             )}
//           </tbody>
//         </Table>
//       </TableContainer>
//     </AccordionPanel>
//   </AccordionItem>

const PaceCalculatorWithFetch: FC<PaceCalculatorProps> = ({ teamName }) => {
  const { teamData, error, isLoading } = useTeamData(teamName);
  const {
    finishTimes,
    error: finishTimesError,
    isLoading: finishTimesIsLoading,
  } = useFinishTimes(teamName);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'Crap 💩',
        message: String(error),
        icon: <IconAlertCircleFilled />,
        color: 'red',
      });
    }
  }, [error]);
  useEffect(() => {
    if (finishTimesError) {
      notifications.show({
        title: 'Crap 💩',
        message: String(finishTimesError),
        icon: <IconAlertCircleFilled />,
        color: 'red',
      });
    }
  }, [finishTimesError]);

  return (
    <>
      <LoadingOverlay visible={isLoading || finishTimesIsLoading} />
      {teamData && finishTimes && (
        <PaceCalculator teamData={teamData} finishTimes={finishTimes} />
      )}
    </>
  );
};

// suspense doesn't really work in nextjs app dir?
export const PaceCalculatorWithSuspense: FC<PaceCalculatorProps> = (props) => {
  return (
    <>
      <Suspense fallback={<LoadingOverlay visible />}>
        <PaceCalculatorWithFetch {...props} />
      </Suspense>
    </>
  );
};

function computeFinishTimesTable(
  data: TeamReactState,
  finishTimes: PartialBy<FinishTimeState, 'id'>[]
) {
  const results: {
    loop: TeamReactState['loops'][number];
    runner: TeamReactState['runners'][number];
    paceLow: Duration;
    paceHigh: Duration;
    loopTimeLow: Duration;
    loopTimeHigh: Duration;
    minimumAllowedFinishTime: Dayjs;
    estimatedLoopFinishLow: Dayjs;
    estimatedLoopFinishHigh: Dayjs;
  }[] = [];
  for (
    let index = 0;
    index < data.runners.length * data.loops.length;
    index++
  ) {
    const runner = data.runners[index % data.runners.length];
    const loop = data.loops[index % data.loops.length];
    const previousRunner =
      index > 0 ? data.runners[(index - 1) % data.runners.length] : undefined;
    const previousLoop =
      index > 0 ? data.loops[(index - 1) % data.loops.length] : undefined;
    const previousFinishTime = finishTimes.find(
      ({ runnerId, loopId }) =>
        loopId === previousLoop?.id && runnerId === previousRunner?.id
    );
    const pace10kDuration = converters.mmssString.toDayJsDuration(
      runner.pace10k
    );
    const paceLow = dayjs.duration(
      data.trailRunMultiplierLow * pace10kDuration.asMilliseconds()
    );
    const paceHigh = dayjs.duration(
      data.trailRunMultiplierHigh * pace10kDuration.asMilliseconds()
    );
    const loopTimeLow = dayjs.duration(
      loop.lengthMiles * paceLow.asMilliseconds()
    );
    const loopTimeHigh = dayjs.duration(
      loop.lengthMiles * paceHigh.asMilliseconds()
    );

    const previousFinishTimeDayJs =
      previousFinishTime?.finishTime === undefined
        ? undefined
        : dayjs(previousFinishTime?.finishTime);
    const loopStartTimeLow =
      index === 0
        ? data.startTime
        : previousFinishTimeDayJs ?? results[index - 1].estimatedLoopFinishLow;
    const loopStartTimeHigh =
      index === 0
        ? data.startTime
        : previousFinishTimeDayJs ?? results[index - 1].estimatedLoopFinishHigh;
    results.push({
      loop,
      runner,
      paceLow,
      paceHigh,
      loopTimeLow,
      loopTimeHigh,
      minimumAllowedFinishTime: loopStartTimeLow,
      estimatedLoopFinishLow: loopStartTimeLow.add(loopTimeLow),
      estimatedLoopFinishHigh: loopStartTimeHigh.add(loopTimeHigh),
    });
  }
  return results;
}
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
