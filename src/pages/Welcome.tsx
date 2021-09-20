import Dialog from '@material-ui/core/Dialog';
import Image from 'next/image';
import welcomePic from '../../public/img/cascadewelcome.png';
import 'twin.macro';
import { useUser } from '@tron/nextjs-auth-p1';
import { LoggedInUser } from '../repositories/userRepo';
import { useOrgs } from '../hooks/api/organizations';
import React from 'react';
import { MenuItem, Select } from '@material-ui/core';
import { Button, TempestSelect } from '../lib/ui';

type OrgFormEvent = React.ChangeEvent<{ value: string }>;

const WelcomePage = () => {
  const { user, isLoading } = useUser<LoggedInUser>();
  const orgsQuery = useOrgs();

  console.log(orgsQuery.data);

  return (
    <Dialog fullScreen open={true}>
      <div tw="flex h-full">
        <div tw="flex flex-col w-2/3 p-20 justify-between">
          <div tw="flex items-center">
            <div tw="bg-secondary rounded-full h-10 w-10 flex items-center justify-center"></div>
            <h1 tw="text-4xl pl-2">CASCADE</h1>
          </div>
          <div tw="pl-10">
            <div tw="pb-8">
              <h2 tw="text-2xl">Welcome To Cascade!</h2>
              <h3 tw="text-lg text-secondary">
                {user?.rank} {user?.lastName}, {user?.firstName}
              </h3>
            </div>
            <div tw="">
              <p tw="pb-2 text-sm">Please select your organization</p>
              <div tw="flex items-center">
                <div>
                  {orgsQuery.isLoading ? (
                    <div>...loading</div>
                  ) : (
                    <TempestSelect
                      variant="outlined"
                      onChange={(event: OrgFormEvent) => console.log(event)}
                      tw="text-gray-400 w-64"
                      value={user?.organizationId ? user?.organizationId : ''}
                    >
                      {orgsQuery.data.map((org) => (
                        <MenuItem key={org.id} value={org.id}>
                          {org.name}
                        </MenuItem>
                      ))}
                    </TempestSelect>
                  )}
                </div>
                <div tw="pl-6">
                  <Button size="large" color="secondary" variant="outlined">
                    Get Started!
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div tw="flex flex-col text-sm text-center">
            <p>Organization doesn't exist?</p>
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
