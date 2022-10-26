import { MenuItem, TextField } from '@mui/material';
import { User } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { useSnackbar } from 'notistack';
import { useState, ChangeEvent } from 'react';
import { ranks } from '../const/ranks';
import { useUpdateUser } from '../hooks/api/users';
import { LoggedInUser } from '../repositories/userRepo';



export const UpdatePersonalInformation = ({userId} : {userId: number}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { mutate: updateUser } = useUpdateUser();
  const { user, refreshUser } = useUser<LoggedInUser>(); 
  const [rank, setRank] = useState('');
  const [afsc, setAfsc] = useState('')
  
  const RankSelect = () => {
  
    const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
     console.log(event?.target.value)
    };
    const updateUserRank = () => {

      if (user.rank !== rank) {
  
        const updatedUser = {
          id: userId,
          rank: rank,
        } as User;
        updateUser(updatedUser, {
          onSuccess: () => {
            refreshUser();
            enqueueSnackbar('Rank Updated', { variant: 'success' });
          },
        });
      }
    }
    return (
    
        <TextField
          sx={{ width: 185 }}
          id="rank_textfield"
          name="rank_textfield"
          select
          label="Rank"
          onChange={() => {
            handleSelect()
            updateUserRank()
          }}
          variant="standard"
          size="small"
        >
          {ranks.map((rankOption) => (
            <MenuItem key={rankOption.value} value={rankOption.value}>
              {rankOption.value}
            </MenuItem>
          ))}
        </TextField>
      
    );
  };

  const AfscInput = () => {
    
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setAfsc(event?.target.value)
      console.log(afsc)
    }

    const updateUserAFSC = () => {if (user.afsc !== afsc) {

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
    }

    return (
    
      <TextField
        sx={{ width: 185 }}
        id="afsc_textfield"
        name='afsc_textfield'
        label="AFSC"
        defaultValue=''
        onMouseLeave={() => {
          handleChange()
          updateUserAFSC()
        }}
        variant="standard"
        size="small"
      />
    
    )
  }

  return (
    <div tw='gap-4 mt-3'>
      <RankSelect />
      <AfscInput />
    </div>
  );
};
