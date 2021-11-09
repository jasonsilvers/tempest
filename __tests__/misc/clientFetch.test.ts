import axios from 'axios';
import { ELogEventType } from '../../src/const/enums';
import { createLog } from '../../src/utils/clientFetch';

jest.mock('axios');

test('fetches successfully data from an API', async () => {
  const data = { message: 'ok' };

  axios.post.mockImplementationOnce(() => Promise.resolve(data));

  await expect(createLog(ELogEventType.PAGE_ACCESS, 'test message')).resolves.toEqual(data);
});
