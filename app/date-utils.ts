import type { TeamData } from '@/server-utils/TeamDataZod';
import dayjs, { ConfigTypeMap, Dayjs } from 'dayjs';
import duration, { Duration } from 'dayjs/plugin/duration';
import objectSupport from 'dayjs/plugin/objectSupport';
import { sortBy } from 'lodash';
import { DateObjectUnits, DateTime } from 'luxon';
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
    toHhmmString(d: Dayjs) {
      return d.format('HH[:]mm').toString();
    },
  },
  hhmmString: {
    toDayJS(s: string) {
      const [hours, minutes] = s.split(':');
      return dayjs({ ...defaultDayJsValues, hours, minutes });
    },
  },
  mmssString: {
    toDayJsDuration(s: string) {
      const [minutes, seconds] = s.split(':').map(Number);
      return dayjs.duration({ minutes, seconds });
    },
    applyMultiplier(d: string, multiplier: number) {
      console.log('applyMultiplier()', d, multiplier);
      const duration = converters.mmssString.toDayJsDuration(d);
      console.log('duration', duration);
      console.log('duration ms', duration.asMinutes());
      console.log(
        'multipledi mins',
        dayjs.duration(multiplier * duration.asMilliseconds()).asMinutes()
      );
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
  // duration: {
  //   /** for text input */
  //   toString(d: Duration) {
  //     return d.toISOTime()!.slice(3, 8);
  //   },
  //   toHuman(t: Duration) {
  //     const hours = t.get('hours');
  //     const isPm = hours % 24 > 12;
  //     if (isPm) {
  //       t = t.set({ hours: hours % 12 });
  //     } else {
  //       t = t.set({ hours: hours % 24 });
  //     }
  //     return `${t.toFormat('hh:mm')} ${isPm ? 'PM' : 'AM'}`;
  //   },
  // },
};
