import { User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { useSnackbar } from 'notistack';
import { useUpdateUser } from '../hooks/api/users';
import { AfscInput } from './AfscInput';
import { RankSelect } from './RankSelect';
import 'twin.macro';

export const UpdatePersonalInformation = ({
  userId,
  userRank,
  userAfsc,
  onChange = null,
  onMouseLeave = null,
}: {
  userId: number;
  userRank: string;
  userAfsc: string;
  onChange?: (rank: string) => void;
  onMouseLeave?: (afsc: string) => void;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: updateUser } = useUpdateUser();
  const { refreshUser } = useUser();

  const updateRank = (_, selectedRank) => {
    if (!selectedRank) {
      return null;
    }
    if (!onChange && selectedRank === userRank) {
      const updatedUser = {
        id: userId,
        rank: selectedRank,
      } as User;
      updateUser(updatedUser, {
        onSuccess: () => {
          refreshUser();
          enqueueSnackbar('Rank Updated', { variant: 'success' });
        },
      });
    }
    if (onChange) {
      onChange(selectedRank);
    }
  };

  const updateAfsc = (_, afsc) => {
    if (!afsc) {
      return null;
    }
    if (!onChange && afsc !== userAfsc) {
      const updatedUser = {
        id: userId,
        afsc: afsc,
      } as User;
      updateUser(updatedUser, {
        onSuccess: () => {
          refreshUser();
          enqueueSnackbar('AFSC Updated', { variant: 'success' });
        },
      });
    }
    if (onMouseLeave) {
      onMouseLeave(afsc);
    }
  };

  return (
    <div tw='flex gap-4 mt-3'>
      <RankSelect onChange={updateRank} />
      <AfscInput onMouseLeave={updateAfsc} />
    </div>
  );
};
