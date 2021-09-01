import { Schema, ValidationError } from 'joi';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export type ValidableRequestFields = Pick<NextApiRequest, 'body' | 'headers' | 'query'>;

export type ValidationSchemas = {
  post?: {
    [V in keyof ValidableRequestFields]?: Schema;
  };
  get?: {
    [V in keyof ValidableRequestFields]?: Schema;
  };
  put?: {
    [V in keyof ValidableRequestFields]?: Schema;
  };
  delete?: {
    [V in keyof ValidableRequestFields]?: Schema;
  };
};

export type ValidationFunction = (schemas: ValidationSchemas, handler?: NextApiHandler) => NextApiHandler;

export type OnValidationError = (
  req: NextApiRequest,
  res: NextApiResponse,
  error: ValidationError
) => void | Promise<void>;

export type Configuration = { onValidationError: OnValidationError };

export default function withValidation(config?: Configuration): ValidationFunction {
  const onValidationError: OnValidationError = config
    ? config.onValidationError
    : (_, res) => res.status(400).json({ message: 'Bad Request' });

  return (schemas, handler) => {
    return (req: NextApiRequest, res: NextApiResponse) => {
      const methods = Object.keys(schemas);

      if (!methods.includes(req.method.toLowerCase())) {
        return handler(req, res);
      }

      const fields: (keyof ValidableRequestFields)[] = ['body', 'headers', 'query'];

      const validationError = fields.reduce<ValidationError | undefined>((error, field) => {
        if (undefined !== error) {
          return error;
        }

        const schema = schemas[req.method.toLowerCase()][field];
        
        const test = schema && schema.required().validate(req[field]).error;
        console.log(test)

        return schema && schema.required().validate(req[field]).error;

        
      }, undefined);

      if (undefined !== validationError) {
        return onValidationError(req, res, validationError);
      }

      if (undefined !== handler) {
        return handler(req, res);
      }

      res.status(404).json({ message: 'Not Found' });
    };
  };
}
