import Joi from 'joi';
import { NextApiRequest, NextApiResponse } from 'next';
import withValidation from '../../src/middleware/withValidation';
import { testNextApi } from '../testutils/NextAPIUtils';

test('should validate api', async () => {
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ message: 'ok' });
  }

  const testSchema = {
    post: {
      body: Joi.object({
        name: Joi.string().required(),
        message: Joi.string().required(),
      }),
    },
  };

  const validate = withValidation();

  const handlerWithValidation = validate(testSchema, testHandler);

  const { status } = await testNextApi.post(handlerWithValidation, {
    body: {
      name: 'joe',
      message: 'frank',
    },
  });

  expect(status).toBe(200);
});

test('should validate api and return 400 if invalid', async () => {
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ message: 'ok' });
  }

  const testSchema = {
    post: {
      body: Joi.object({
        name: Joi.string().required(),
        message: Joi.string().required(),
      }),
    },
  };

  const validate = withValidation();

  const handlerWithValidation = validate(testSchema, testHandler);

  const { status } = await testNextApi.post(handlerWithValidation, {
    body: {
      name: 2,
      message: 'frank',
    },
  });

  expect(status).toBe(400);
});

test('should not validate if incorrect method', async () => {
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ message: 'ok' });
  }

  const testSchema = {
    put: {
      body: Joi.object({
        name: Joi.string().required(),
        message: Joi.string().required(),
      }),
    },
  };

  const validate = withValidation();

  const handlerWithValidation = validate(testSchema, testHandler);

  const { status } = await testNextApi.post(handlerWithValidation, {
    body: {
      name: 2,
      message: 'frank',
    },
  });

  expect(status).toBe(200);
});

test('should override default message', async () => {
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ message: 'ok' });
  }

  const testSchema = {
    post: {
      body: Joi.object({
        name: Joi.string().required(),
        message: Joi.string().required(),
      }),
    },
  };

  const config = {
    onValidationError: (_, res) => res.status(400).json({ message: 'override' }),
  };

  const validate = withValidation(config);

  const handlerWithValidation = validate(testSchema, testHandler);

  const { status, data } = await testNextApi.post(handlerWithValidation, {
    body: {
      name: 2,
      message: 'frank',
    },
  });

  expect(status).toBe(400);
  expect(data).toStrictEqual({ message: 'override' });
});

test('should override default message', async () => {
  async function testHandler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ message: 'ok' });
  }

  const testSchema = {
    post: {
      body: Joi.object({
        name: Joi.string().required(),
        message: Joi.string().required(),
      }),
    },
  };

  const config = {
    onValidationError: (_, res) => res.status(400).json({ message: 'override' }),
  };

  const validate = withValidation(config);

  const handlerWithValidation = validate(testSchema, testHandler);

  const { status, data } = await testNextApi.post(handlerWithValidation, {
    body: {
      name: 2,
      message: 'frank',
    },
  });

  expect(status).toBe(400);
  expect(data).toStrictEqual({ message: 'override' });
});

test('should return 404 if no handler found', async () => {
  const testSchema = {
    post: {
      body: Joi.object({
        name: Joi.string().required(),
        message: Joi.string().required(),
      }),
    },
  };

  const config = {
    onValidationError: (_, res) => res.status(400).json({ message: 'override' }),
  };

  const validate = withValidation(config);

  const handlerWithValidation = validate(testSchema, undefined);

  const { status, data } = await testNextApi.post(handlerWithValidation, {
    body: {
      name: 'joe',
      message: 'frank',
    },
  });

  expect(status).toBe(404);
  expect(data).toStrictEqual({ message: 'Not Found' });
});
