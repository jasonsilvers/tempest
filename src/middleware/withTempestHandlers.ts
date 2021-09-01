import { DBQueryFunctionToReturnUser, withApiAuth } from '@tron/nextjs-auth-p1';
import { NextApiHandler } from 'next';
import { withErrorHandling } from './withErrorHandling';
import withValidation, { ValidationSchemas } from './withValidation';

export function withTempestHandlers(
  nextApiHandler: NextApiHandler,
  getUserFunc: DBQueryFunctionToReturnUser,
  schemas: ValidationSchemas = {},
  withLogging = true
) {
  const validate = withValidation();

  return withErrorHandling(withApiAuth(validate(schemas, nextApiHandler), getUserFunc), withLogging);
}
