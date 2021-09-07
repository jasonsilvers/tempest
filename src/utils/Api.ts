import { ELogEventType, EUri } from '../types/global';
import axios from 'axios';

const createLog = (logEventType: ELogEventType, message: string) => {
  axios.post(EUri.LOGS, {
    logEventType,
    message,
  });
};

export { createLog };
