'use client';
import { converters } from '@/app/date-utils';
import type { TeamData } from '@/server-utils/TeamDataZod';
import {
  Accordion,
  ActionIcon,
  Box,
  Group,
  Input,
  Loader,
  LoadingOverlay,
  Paper,
  Table,
  Text,
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
import { FC, Suspense, useEffect, useMemo, useState } from 'react';
import { PatternFormat, PatternFormatProps } from 'react-number-format';
import { useImmer } from 'use-immer';
import { useDebounce } from '../utils/useDebounce';
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

const PaceCalculator: FC<{ teamData: TeamData }> = ({ teamData }) => {
  const [data, updateData] = useImmer(() =>
    converters.teamDbData.toReactState(teamData)
  );
  const [initialData] = useState(data);
  const { mutate } = useTeamData(teamData.name);

  const { debouncedValue: debouncedData, isDebouncing } = useDebounce(
    data,
    1000
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (debouncedData === 'not yet' || debouncedData === initialData) {
      return;
    }
    setIsSaving(true);
    (async () => {
      const dbData = converters.teamReactState.toDbData(debouncedData);
      try {
        const r = await fetch(`/api/team/${debouncedData.name}`, {
          method: 'POST',
          body: JSON.stringify(dbData),
        });
        if (!r.ok) {
          throw new Error(r.statusText);
        }
        mutate(dbData);
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
  }, [debouncedData, initialData, mutate]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '800px',
      }}
    >
      <Transition
        mounted={isDebouncing || isSaving}
        transition="fade"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => {
          return (
            <Paper
              style={styles}
              sx={{
                position: 'absolute',
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
      <Accordion defaultValue={'Pace Calculator'}>
        <Accordion.Item value="runners">
          <Accordion.Control>Runners</Accordion.Control>
          <Accordion.Panel pb={4}>
            <Text>Team Start Time</Text>
            <TimeInput
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
                        onChange={(event) => {
                          const value = event.target.value;
                          if (value.includes('-')) {
                            return;
                          }
                          updateData((data) => {
                            data.runners[index].pace10k = event.target.value;
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
          <Accordion.Panel pb={4}>deets</Accordion.Panel>
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

//   <AccordionItem>
//     <h2>
//       <AccordionButton>
//         <Box flex="1" textAlign="left">
//           Runners
//         </Box>
//         <AccordionIcon />
//       </AccordionButton>
//     </h2>
//     <AccordionPanel pb={4}>
//       <Text>Team Start Time</Text>
//       <CustomTimeField
//         value={data.teamStartTime}
//         onChange={(newStartTime) => {
//           updateData((data) => {
//             data.teamStartTime = newStartTime;
//           });
//         }}
//         onClear={() => {
//           updateData((data) => {
//             data.teamStartTime = DateTime.fromObject(defaultDateValues);
//           });
//         }}
//       />
//       <TableContainer>
//         <Table size="sm">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Name</th>
//               <th>10k pace (minutes per mile)</th>
//               <th>Move</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.runners.map((runner, index) => (
//               <tr key={index}>
//                 <td>{index + 1}</td>
//                 <td className={css`
//                   min-width: 150px;
//                 `}>
//                   <Input
//                     size="sm"
//                     value={runner.name}
//                     onChange={(event) => {
//                       updateData((draft) => {
//                         draft.runners[index].name = event.target.value;
//                       });
//                     }}
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     size="sm"
//                     as={DurationInput}
//                     value={userInput.runners[index].pace_10k}
//                     onChange={(event) => {
//                       updateUserInput((userInput) => {
//                         userInput.runners[index].pace_10k =
//                           event.target.value;
//                       });
//                     }}
//                   />
//                 </td>
//                 <td>
//                   <ButtonGroup isAttached>
//                     <IconButton
//                       icon={<ArrowUpIcon />}
//                       disabled={index === 0}
//                       aria-label="move up"
//                       onClick={() => {
//                         updateData((data) => {
//                           moveUp(data.runners, index);
//                         });
//                         updateUserInput((draft) => {
//                           moveUp(draft.runners, index);
//                         });
//                       }}
//                     />
//                     <IconButton
//                       icon={<ArrowDownIcon />}
//                       disabled={index === data.runners.length - 1}
//                       aria-label="move down"
//                       onClick={() => {
//                         updateData((data) => {
//                           moveDown(data.runners, index);
//                         });
//                         updateUserInput((draft) => {
//                           moveDown(draft.runners, index);
//                         });
//                       }}
//                     />
//                   </ButtonGroup>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </TableContainer>
//     </AccordionPanel>
//   </AccordionItem>
//   <AccordionItem>
//     <h2>
//       <AccordionButton>
//         <Box flex="1" textAlign="left">
//           Loops
//         </Box>
//         <AccordionIcon />
//       </AccordionButton>
//     </h2>
//     <AccordionPanel pb={4}>
//       <TableContainer>
//         <Table size="sm">
//           <thead>
//             <tr>
//               <th>Loop</th>
//               <th>Length (miles)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.loops.map((loop, index) => (
//               <tr key={index}>
//                 <td>
//                   <Input
//                     value={loop.name}
//                     onChange={(event) => {
//                       updateData((draft) => {
//                         draft.loops[index].name = event.target.value;
//                       });
//                     }}
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     type="number"
//                     value={userInput.loops[index].length_miles}
//                     onChange={(event) => {
//                       updateUserInput((userInput) => {
//                         userInput.loops[index].length_miles =
//                           event.target.value;
//                       });
//                     }}
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </TableContainer>
//     </AccordionPanel>
//   </AccordionItem>
//   <AccordionItem>
//     <h2>
//       <AccordionButton>
//         <Box flex="1" textAlign="left">
//           Pace Calculator
//         </Box>
//         <AccordionIcon />
//       </AccordionButton>
//     </h2>
//     <AccordionPanel pb={4}>
//       <TableContainer>
//         <Table size="sm">
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Estimated Trail Pace (minutes per mile)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.runners.map((runner, index) => (
//               <tr key={index}>
//                 <td>{runner.name}</td>
//                 <td>
//                   {converters.duration.toString(
//                     converters.duration.applyMultiplier(
//                       runner.pace_10k,
//                       data.trailRunMultiplierLow
//                     )
//                   )}
//                   -
//                   {converters.duration.toString(
//                     converters.duration.applyMultiplier(
//                       runner.pace_10k,
//                       data.trailRunMultiplierHigh
//                     )
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </TableContainer>
//       <InputGroup>
//         <Text fontSize="xs">Trail Running Pace Multiplier (low)</Text>
//         <Input
//           value={data.trailRunMultiplierLow}
//           type="number"
//           size="sm"
//           onChange={(event) => {
//             updateData((data) => {
//               data.trailRunMultiplierLow =
//                 parseFloat(event.target.value) || 1.1;
//             });
//           }}
//         />
//       </InputGroup>
//       <InputGroup>
//         <Text fontSize="xs">Trail Running Pace Multiplier (high)</Text>
//         <Input
//           value={data.trailRunMultiplierHigh}
//           type="number"
//           size="sm"
//           onChange={(event) => {
//             updateData((data) => {
//               data.trailRunMultiplierHigh =
//                 parseFloat(event.target.value) || 1.2;
//             });
//           }}
//         />
//       </InputGroup>
//     </AccordionPanel>
//   </AccordionItem>
//   <AccordionItem>
//     <h2>
//       <AccordionButton>
//         <Box flex="1" textAlign="left">
//           Estimated Start/Finish Times
//         </Box>
//         <AccordionIcon />
//       </AccordionButton>
//     </h2>
//     <AccordionPanel pb={4}>
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
  return (
    <>
      <LoadingOverlay visible={isLoading} />
      {teamData && <PaceCalculator teamData={teamData} />}
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
