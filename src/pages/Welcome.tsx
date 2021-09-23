import Dialog from '@material-ui/core/Dialog';
import Image from 'next/image';
import welcomePic from '../../public/img/cascadewelcome.png';
import { useUser } from '@tron/nextjs-auth-p1';
import { LoggedInUser } from '../repositories/userRepo';
import { Button } from '../lib/ui';
import { UpdateUsersOrg } from '../components/UpdateUsersOrg';
import { useRouter } from 'next/router';

import 'twin.macro';

const WelcomePage = () => {
  const { user, isLoading } = useUser<LoggedInUser>();
  const router = useRouter();

  return (
    <Dialog fullScreen open={true}>
      <div tw="flex h-full">
        <div tw="flex flex-col w-2/3 p-20 justify-between">
          <div tw="flex items-center">
            <div tw="bg-secondary rounded-full h-10 w-10 flex items-center justify-center"></div>
            <h1 tw="text-4xl pl-2">CASCADE</h1>
          </div>
          <div tw="pl-20">
            <div tw="pb-8">
              <h2 tw="text-2xl">Welcome To Cascade!</h2>
              <h3 tw="text-lg text-secondary">
                {isLoading && '...Loading'}
                {user?.rank ? user?.rank : ''} {user?.lastName}, {user?.firstName}
              </h3>
            </div>
            <div>
              <p tw="pb-2 text-sm">Please select your organization</p>
              <div tw="flex items-center">
                <div>
                  <UpdateUsersOrg
                    userId={user?.id}
                    userOrganizationId={user?.organizationId ? user.organizationId : ''}
                  />
                </div>
                <div tw="pl-6">
                  <Button
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
          <div tw="flex flex-col text-sm text-center">
            <p>Organization doesn&apos;t exist?</p>
            <p>*Please contact us at contactus@tron.dso.mil so we can create one!</p>
          </div>
        </div>
        <div tw="w-1/3 relative">
          <Image layout="fill" src={welcomePic} alt="new drop of water" />
        </div>
      </div>
    </Dialog>
  );
};

export default WelcomePage;
