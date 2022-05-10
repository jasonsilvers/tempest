import { joiResolver } from '@hookform/resolvers/joi';
import {
  Avatar,
  Box,
  Button,
  Card,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  styled,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { User } from '@prisma/client';
import { useUser, withPageAuth } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'twin.macro';
import { ranks } from '../const/ranks';
import { useOrgs } from '../hooks/api/organizations';
import { useUpdateUser } from '../hooks/api/users';
import { LoggedInUser } from '../repositories/userRepo';

interface IStyledTabProps {
  label: string;
}

const StyledTab = styled((props: IStyledTabProps) => <Tab {...props} />)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(14),
  paddingLeft: theme.spacing(12),
  paddingRight: theme.spacing(12),
}));

interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: ITabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ px: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const workFormSchema = Joi.object({
  organization: Joi.required(),
  dutyTitle: Joi.string().optional().allow(''),
  afsc: Joi.string().optional().allow(''),
});

const WorkForm = ({ user }: { user: LoggedInUser }) => {
  const orgsQuery = useOrgs();
  const snackbar = useSnackbar();
  const userMutation = useUpdateUser();
  const {
    control,
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(workFormSchema),
    defaultValues: {
      organization: 'none',
      dutyTitle: '',
      afsc: '',
    },
  });

  useEffect(() => {
    if (user.organization) {
      setValue('organization', user.organization.id.toString());
    }

    setValue('dutyTitle', user.dutyTitle);
    setValue('afsc', user.afsc);
  }, [user, setValue]);

  const onSubmit = (data) => {
    userMutation.mutate(
      {
        id: user.id,
        organizationId: data.organization,
        dutyTitle: data.dutyTitle,
        afsc: data.afsc,
      } as User,
      {
        onSuccess: () => {
          snackbar.enqueueSnackbar('Profile Updated!', { variant: 'success' });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div tw="flex p-7 content-center items-center space-x-12">
        <div tw="w-1/4">
          <Typography tw="text-gray-500">ORGANIZATION</Typography>
        </div>

        <FormControl fullWidth error={!!errors.organization}>
          <Controller
            name="organization"
            control={control}
            render={({ field }) => (
              <Select {...field} fullWidth size="small" error={!!errors.organization}>
                <MenuItem key="noneselected" value="none">
                  No Org Selected
                </MenuItem>
                {orgsQuery?.data?.map((org) => {
                  return (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  );
                })}
              </Select>
            )}
          />

          <FormHelperText>{errors.organization ? errors.organization.message : null}</FormHelperText>
        </FormControl>
      </div>

      <div tw="flex p-7 content-center items-center space-x-12">
        <div tw="w-1/4">
          <Typography tw="text-gray-500">DUTY TITLE</Typography>
        </div>

        <FormControl fullWidth error={!!errors.dutyTitle}>
          <TextField
            error={!!errors.dutyTitle}
            fullWidth
            size="small"
            inputProps={{ ...register('dutyTitle'), 'aria-label': 'dutyTitle' }}
          />
          <FormHelperText>{errors.dutyTitle ? errors.dutyTitle.message : null}</FormHelperText>
        </FormControl>
      </div>

      <div tw="flex p-7 content-center items-center space-x-12">
        <div tw="w-1/4">
          <Typography tw="text-gray-500">AFSC</Typography>
        </div>

        <FormControl fullWidth error={!!errors.afsc}>
          <TextField
            error={!!errors.afsc}
            fullWidth
            size="small"
            inputProps={{ ...register('afsc'), 'aria-label': 'afsc' }}
          />
          <FormHelperText>{errors.afsc ? errors.afsc.message : null}</FormHelperText>
        </FormControl>
      </div>

      <div tw="pb-7 pt-4 flex space-x-4 justify-center">
        <Button variant="contained" color="secondary" type="submit">
          Update
        </Button>
        {/* Send to the training record page */}
        <Button
          color="secondary"
          onClick={() =>
            reset({ organization: user.organizationId.toString(), dutyTitle: user.dutyTitle, afsc: user.afsc })
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

const personalFormSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  rankSelect: Joi.string().optional(),
});

const PersonalForm = ({ user }: { user: LoggedInUser }) => {
  const snackbar = useSnackbar();
  const userMutation = useUpdateUser();
  const {
    control,
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(personalFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      rankSelect: '',
    },
  });

  useEffect(() => {
    setValue('firstName', user.firstName);
    setValue('lastName', user.lastName);
    setValue('rankSelect', user.rank);
  }, [user, setValue]);

  const onSubmit = (data) => {
    userMutation.mutate(
      {
        id: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        rank: data.rankSelect,
      } as User,
      {
        onSuccess: () => {
          snackbar.enqueueSnackbar('Profile Updated!', { variant: 'success' });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div tw="flex p-7 content-center items-center space-x-12">
        <div tw="w-1/4">
          <Typography tw="text-gray-500">FIRST NAME</Typography>
        </div>

        <FormControl fullWidth error={!!errors.firstName}>
          <TextField
            error={!!errors.firstName}
            fullWidth
            size="small"
            inputProps={{ ...register('firstName'), 'aria-label': 'firstName' }}
          />
          <FormHelperText>{errors.firstName ? errors.firstName.message : null}</FormHelperText>
        </FormControl>
      </div>

      <div tw="flex p-7 content-center items-center space-x-12">
        <div tw="w-1/4">
          <Typography tw="text-gray-500">LAST NAME</Typography>
        </div>

        <FormControl fullWidth error={!!errors.lastName}>
          <TextField
            error={!!errors.lastName}
            fullWidth
            size="small"
            inputProps={{ ...register('lastName'), 'aria-label': 'lastName' }}
          />
          <FormHelperText>{errors.lastName ? errors.lastName.message : null}</FormHelperText>
        </FormControl>
      </div>

      <div tw="flex p-7 content-center items-center space-x-12">
        <div tw="w-1/4">
          <Typography tw="text-gray-500">RANK</Typography>
        </div>

        <FormControl fullWidth error={!!errors.rankSelect}>
          <Controller
            name="rankSelect"
            control={control}
            render={({ field }) => (
              <Select {...field} fullWidth size="small" error={!!errors.rankSelect}>
                <MenuItem key="noneselected" value="none">
                  No Rank
                </MenuItem>
                {ranks.map((rank) => (
                  <MenuItem key={rank.value} value={rank.value}>
                    {rank.value}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText>{errors.rankSelect ? errors.rankSelect.message : null}</FormHelperText>
        </FormControl>
      </div>

      <div tw="pb-7 pt-4 flex space-x-4 justify-center">
        <Button variant="contained" color="secondary" type="submit">
          Update
        </Button>
        {/* Send to the training record page */}
        <Button
          color="secondary"
          onClick={() => reset({ firstName: user.firstName, lastName: user.lastName, rankSelect: user.rank })}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

const AccountPage = () => {
  const { user, isLoading } = useUser<LoggedInUser>();
  const [tabValue, setTabValue] = React.useState(0);
  const theme = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <Card tw="p-8">
      <div tw="flex flex-col items-center space-y-4">
        <Avatar sx={{ height: 96, width: 96, bgcolor: theme.palette.secondary.main }}>
          <Typography variant="h4">
            {user?.firstName.charAt(0)}
            {user?.lastName.charAt(0)}
          </Typography>
        </Avatar>
        <Typography variant="h4">
          {user?.firstName} {user?.lastName}
        </Typography>
      </div>
      <div tw="flex flex-col items-center">
        <div tw="p-10">
          <Tabs value={tabValue} onChange={handleTabChange}>
            <StyledTab label="PERSONAL" {...a11yProps(0)} />
            <StyledTab label="WORK" {...a11yProps(0)} />
          </Tabs>
        </div>
        <div tw="w-[720px] h-full border rounded-md">
          <TabPanel value={tabValue} index={0}>
            <PersonalForm user={user} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <WorkForm user={user} />
          </TabPanel>
        </div>
      </div>
      <div tw="flex justify-center pt-20 text-gray-400">
        <Typography>Need monitor access? Please contact a Tron team member</Typography>
      </div>
    </Card>
  );
};

export default withPageAuth(AccountPage);
