import { ELogEventType } from '../types/global';
import axios from 'axios';
import { EUri } from '../types/global';

const createLog = (logEventType: ELogEventType, message: string) => {
  axios.post(EUri.LOGS, {
    logEventType,
    message,
  });
};

export { createLog };
