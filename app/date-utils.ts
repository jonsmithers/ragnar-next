import type { TeamData } from '@/server-utils/TeamDataZod';
import dayjs, { ConfigTypeMap, Dayjs } from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import { sortBy } from 'lodash';
import { DateObjectUnits, DateTime, Duration } from 'luxon';
dayjs.extend(objectSupport);

export function defaultTime() {
  return DateTime.fromObject(defaultDateValues);
}

const defaultDayJsValues: ConfigTypeMap['objectSupport'] = {
  year: 2000,
  minute: 0,
  hour: 0,
};
const defaultDateValues: DateObjectUnits = {
  year: 2000,
};

export interface TeamReactState {
  id: number;
  name: string;
  trailRunMultiplierLow: number;
  trailRunMultiplierHigh: number;
  startTime: Dayjs;
  runners: TeamData['runners'];
  loops: TeamData['loops'];
}

export const converters = {
  teamDbData: {
    toReactState(data: TeamData): TeamReactState {
      const { startTime, runners, loops, ...otherData } = data;
      return {
        ...otherData,
        startTime: dayjs(startTime),
        runners: sortBy(data.runners, 'order'),
        loops: sortBy(data.loops, 'order'),
      };
    },
  },
  teamReactState: {
    toDbData(reactState: TeamReactState): TeamData {
      const { startTime, ...otherState } = reactState;
      return {
        ...otherState,
        startTime: reactState.startTime.toDate(),
      };
    },
  },
  dayjs: {
    toTimeInputString(d: Dayjs) {
      return d.format('HH[:]mm').toString();
    },
  },
  mantine: {
    timeInputString: {
      toDayJS(s: string) {
        const [hours, minutes] = s.split(':');
        return dayjs({ ...defaultDayJsValues, hours, minutes });
      },
    },
  },
  dateTime: {
    toHuman(d: DateTime) {
      return d.toFormat('hh:mm a');
    },
  },
  duration: {
    /** for text input */
    toString(d: Duration) {
      return d.toISOTime()!.slice(3, 8);
    },
    applyMultiplier(d: Duration, multiplier: number) {
      return Duration.fromMillis(d.toMillis() * multiplier);
    },
    toHuman(t: Duration) {
      const hours = t.get('hours');
      const isPm = hours % 24 > 12;
      if (isPm) {
        t = t.set({ hours: hours % 12 });
      } else {
        t = t.set({ hours: hours % 24 });
      }
      return `${t.toFormat('hh:mm')} ${isPm ? 'PM' : 'AM'}`;
    },
  },
};
