export const useTestRouter = jest.spyOn(require('next/router'), 'useRouter');

export const useTestUser = jest.spyOn(
  require('@tron/nextjs-auth-p1'),
  'useUser'
);
