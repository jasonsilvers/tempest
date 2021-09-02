import axios from 'axios';
import { withErrorHandling } from '../utils';

const getMattermostUrl = () => process.env.MATTERMOST_API;
const getMattermostKey = () => process.env.MATTERMOST_WEBHOOK_KEY;

export type MattermostWebhookResponse = {
  data: string;
};

const _sendMessage = (channel: string, text: string) => {
  return axios.post(`${getMattermostUrl()}/hooks/${getMattermostKey()}`, {
    channel,
    text,
  });
};

const sendMessage = withErrorHandling(_sendMessage);

export { sendMessage };
