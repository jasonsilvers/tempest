const axios = require('axios');

const postMessageAsWebHook = async (message) => {
  const payload = {
    text: message,
    username: 'cascade bot', // should work but is disabled on preprod and IL4
    // channel: '@snekcode'
  };
  return axios.post('https://chat.preprod.dso.mil/hooks/it9paxscktdjdxnykw4t79917r', payload);
};

postMessageAsWebHook('Hello, I am Cascade. I am here to help you.');

const postMessageAsBot = async (message) => {
  return axios.post(
    'https://chat.preprod.dso.mil/api/v4/posts',
    {
      channel_id: 'd38ikcz31in5myq3rt3y5bzowh',
      message: message,
    },
    { headers: { Authorization: `Bearer ybiopt9hijnu7c84tgreo7qxbr` } }
  );
};
// postMessageAsBot('Hello, I am Cascade Bot. I am here to help you.');
