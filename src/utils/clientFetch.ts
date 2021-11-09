import { ELogEventType, EUri } from '../const/enums';
import axios from 'axios';

const createLog = async (logEventType: ELogEventType, message: string) => {
  return axios.post(EUri.LOGS, {
    logEventType,
    message,
  });
};

export { createLog };
