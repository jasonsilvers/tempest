import { LogEventType } from '@prisma/client';
import log, { LogLevelDesc } from 'loglevel';

type TempestLog = typeof log & {
  persist: (logEventType: LogEventType, message: string) => Promise<void>;
};

const tempestLog = log as unknown as TempestLog;

export { tempestLog as log };

export type { LogLevelDesc };
