import { Button, Card, InputAdornment, TextField, Typography } from '@mui/material';
import { MemberTrackingRecord, TrackingItem } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useMemo } from 'react';
import { useQueryClient, UseQueryResult } from 'react-query';
import 'twin.macro';
import { SearchIcon } from '../../assets/Icons';
import { EMtrVerb } from '../../const/enums';
import { useUpdateMemberTrackingRecord } from '../../hooks/api/memberTrackingRecord';
import { usersQueryKeys } from '../../hooks/api/users';
import { useRouter } from 'next/router';
import { LoggedInUser, UserWithAll } from '../../repositories/userRepo';

type MassSignProps = {
  usersQuery: UseQueryResult<UserWithAll[]>;
};

export const MassSign = ({ usersQuery }: MassSignProps) => {
  const { user: loggedInUser } = useUser<LoggedInUser>();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: signAuthorityFor } = useUpdateMemberTrackingRecord(EMtrVerb.SIGN_AUTHORITY);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const router = useRouter();
  const userListWithRecordsToSign = useMemo(() => {
    return usersQuery.data
      ?.filter((user) =>
        user.memberTrackingItems.some((mti) =>
          mti.memberTrackingRecords.some((mtr) => mtr.authoritySignedDate === null && mtr.completedDate !== null)
        )
      )
      .filter((user2) => user2.id !== loggedInUser?.id);
  }, [usersQuery.data]);

  const handleSign = (memberTrackingRecord: MemberTrackingRecord & { trackingItem: TrackingItem }) => {
    signAuthorityFor(
      { memberTrackingRecord, userId: memberTrackingRecord.traineeId },
      {
        onSuccess: () => {
          enqueueSnackbar('A record was successfully Signed', { variant: 'success' });
        },
        onError: () => {
          enqueueSnackbar('Unable to sign record please try again', { variant: 'error' });
        },

        onSettled: () => {
          queryClient.invalidateQueries(usersQueryKeys.users());
        },
      }
    );
  };

  return (
    <Card tw="flex flex-col h-[46.2rem] overflow-auto">
      <div tw="p-5">
        <Typography variant="h6">Sign Training</Typography>
      </div>
      <div tw="w-full px-5 pb-5">
        <TextField
          tw="bg-white rounded w-full"
          id="SearchBar"
          label="Search"
          size="small"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>
      {userListWithRecordsToSign?.length === 0 ? <div tw="p-5">Nothing to sign</div> : null}
      {userListWithRecordsToSign
        ?.filter((user) => {
          if (searchTerm === '') {
            return true;
          }

          return (
            user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0 ||
            user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0
          );
        })
        .map((user) => (
          <div key={user.id}>
            <div tw="bg-gray-200 px-5 py-2 font-medium">
              <span
                tw="underline text-primary cursor-pointer"
                onClick={() => router.push(`/Tempest/Profile/${user.id}`)}
              >
                {user.rank} {user.firstName} {user.lastName}
              </span>
            </div>
            <div>
              {user.memberTrackingItems
                .filter((mti) =>
                  mti.memberTrackingRecords.some(
                    (mtr) => mtr.authoritySignedDate === null && mtr.completedDate !== null
                  )
                )
                .map((mti) => (
                  <div key={`${mti.trackingItemId}${mti.userId}`} tw="px-5 py-2">
                    {mti.memberTrackingRecords
                      ?.filter((mtr) => mtr.authoritySignedDate === null)
                      .map((mtr) => (
                        <div key={mtr.id} tw="flex items-center w-full">
                          <div tw="mr-auto flex w-full">
                            <div tw="w-2/3">{mti.trackingItem.title}</div>
                            <div tw="w-1/3">{dayjs(mtr.completedDate).format('MM/DD/YY')}</div>
                          </div>
                          <Button onClick={() => handleSign(mtr)} variant="outlined" color="secondary">
                            Sign
                          </Button>
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          </div>
        ))}
    </Card>
  );
};
