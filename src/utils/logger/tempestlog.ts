import { ELogEventType } from '../../types/global';
import log, { LogLevelDesc } from 'loglevel';

type TempestLog = typeof log & {
  persist: (logEventType: ELogEventType, message: string) => Promise<void> | (() => void);
};

const tempestLog = log as unknown as TempestLog;

export { tempestLog as log };

export type { LogLevelDesc };
