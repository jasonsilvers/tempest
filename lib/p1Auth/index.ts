import { withPageAuthFactory } from './utils/with-page-auth-factory';

const env = process?.env;

const { P1_AUTH_JWT_KEY_DESCRIMINATOR } = env;
const configs = {
  P1_AUTH_JWT_KEY_DESCRIMINATOR
};
export const withPageAuth = withPageAuthFactory(configs);

//Export types here
export {};
