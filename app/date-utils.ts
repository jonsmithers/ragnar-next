import type { TeamData } from '@/server-utils/TeamDataZod';
import dayjs, { ConfigTypeMap, Dayjs } from 'dayjs';
import duration, { Duration } from 'dayjs/plugin/duration';
import objectSupport from 'dayjs/plugin/objectSupport';
import { sortBy } from 'lodash';
import { DateObjectUnits, DateTime } from 'luxon';
import { FinishTimeState } from './team/utils/useFinishTimes';
import { FinishTime } from '@/server-utils/FinishTimeZod';
dayjs.extend(objectSupport);
dayjs.extend(duration);

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
    toHhmmString(d: Dayjs | undefined) {
      if (d === undefined) {
        return '';
      }
      return d.format('HH[:]mm').toString();
    },
    toHuman(d: Dayjs | undefined) {
      if (d === undefined) {
        return '';
      }
      return d.format('h[:]mm a').toString();
    }
  },
  date: {
    toHhmmString(d: Date | undefined) {
      if (d === undefined) {
        return '';
      }
      return converters.dayjs.toHhmmString(dayjs(d))
    }
  },
  hhmmString: {
    toDayJS(s: string) {
      const [hours, minutes] = s.split(':');
      return dayjs({ ...defaultDayJsValues, hours, minutes });
    },
    toDate(s: string) {
      return converters.hhmmString.toDayJS(s).toDate();
    }
  },
  mmssString: {
    toDayJsDuration(s: string) {
      const [minutes, seconds] = s.split(':').map(Number);
      return dayjs.duration({ minutes, seconds });
    },
    applyMultiplier(d: string, multiplier: number) {
      const duration = converters.mmssString.toDayJsDuration(d);
      return converters.dayjsDuration.toMmssString(
        dayjs.duration(multiplier * duration.asMilliseconds())
      );
    },
  },
  dateTime: {
    toHuman(d: DateTime) {
      return d.toFormat('hh:mm a');
    },
  },
  dayjsDuration: {
    toHhmmString(d: Duration) {
      return d.format('HH[:]mm').toString();
    },
    toMmssString(d: Duration) {
      return d.format('mm[:]ss').toString();
    }
  },
};
