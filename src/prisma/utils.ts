import { exec } from 'child_process';
import * as util from 'util';

const execPromisify = util.promisify(exec);

export const clear = async () =>
  execPromisify('npx prisma migrate reset --force --skip-seed --schema ./src/prisma/schema.prisma');
