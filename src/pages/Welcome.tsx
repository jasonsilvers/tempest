import { Button } from '@mui/material';
import { useUser } from '@tron/nextjs-auth-p1';
import { useRouter } from 'next/router';
import 'twin.macro';
import { UpdateUsersOrg } from '../components/UpdateUsersOrg';
import { usePageLogging } from '../hooks/usePageLogging';
import { Dialog } from '../lib/ui';
import { LoggedInUser } from '../repositories/userRepo';

const WelcomePage = () => {
  const { user, isLoading } = useUser<LoggedInUser>();
  const router = useRouter();
  usePageLogging();

  return (
    <>
      <Dialog fullScreen open={true}>
        <div tw="flex h-full">
          <div tw="flex flex-col w-2/3 p-20 justify-between">
            <div tw="flex items-center"></div>
            <div tw="pl-20">
              <div tw="pb-8">
                <h2 tw="text-4xl pt-6 pb-2">Welcome To Cascade!</h2>
                <h3 tw="text-3xl text-secondary">
                  {isLoading && '...Loading'}
                  {user?.rank ? user?.rank : ''} {user?.lastName}, {user?.firstName}
                </h3>
              </div>
              <div>
                <p tw="pb-6 text-lg">Please select your organization</p>
                <div tw="flex items-center">
                  <div tw="w-96">
                    <UpdateUsersOrg
                      userId={user?.id}
                      userOrganizationId={user?.organizationId ? user.organizationId : null}
                    />
                  </div>
                  <div tw="pl-6">
                    <Button
                      sx={{ height: '56px' }}
                      disabled={!user?.organizationId}
                      onClick={() => router.push('/')}
                      size="large"
                      color="secondary"
                      variant="outlined"
                    >
                      Get Started!
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div tw="flex flex-col text-sm text-center pt-5">
              <p>
                Creating your own Organization?{' '}
                <span tw="text-secondary cursor-pointer hover:underline" onClick={() => router.push('/Onboard')}>
                  Start Here
                </span>
              </p>
            </div>
          </div>
          {/* Fix the image placement */}
          <div tw="w-1/2 flex ">
            <img alt="Cascade Welcome Image" tw="h-3/4 w-3/4 justify-center items-center " src="/img/cascadelogo.png" />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default WelcomePage;
