import { LogEventType } from '@prisma/client';
import axios from 'axios';
import { EUri } from '../types/global';

const createLog = (logEventType: LogEventType, message: string) => {
  axios.post(EUri.LOGS, {
    logEventType,
    message,
  });
};

export { createLog };
