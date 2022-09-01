import { Avatar, Card, Divider, Typography, useTheme } from '@mui/material';
import { Organization, Role, User } from '@prisma/client';
import 'twin.macro';

const ProfileHeader: React.FC<{
  member: User & { role: Role; organization: Organization; reportingOrganization: Organization };
}> = ({ member }) => {
  const theme = useTheme();

  const rankDisplay = !member?.rank || member.rank === '' ? 'RANK' : member.rank;
  const afscDisplay = !member?.afsc || member.afsc === '' ? 'AFSC' : member.afsc;
  const orgDisplay = member?.reportingOrganization ? member.reportingOrganization.shortName : 'Organization';

  return (
    <Card tw="relative min-w-min max-width[1440px] h-20 py-4 flex items-center justify-evenly">
      <div tw="flex items-center justify-around flex-grow">
        <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
          {member?.firstName.charAt(0)}
          {member?.lastName.charAt(0)}
        </Avatar>
        <Typography variant="h5" component="h5">
          {member?.firstName} {member?.lastName}
        </Typography>
      </div>
      <Divider orientation="vertical" variant="middle" flexItem />
      <div tw="flex-grow flex justify-around">
        <Typography variant="body1" component="p">
          {rankDisplay}
        </Typography>
      </div>
      <Divider orientation="vertical" variant="middle" flexItem />
      <div tw="flex-grow flex justify-around">
        <Typography variant="body1" component="p">
          {orgDisplay}
        </Typography>
      </div>
      <Divider orientation="vertical" variant="middle" flexItem />
      <div tw="flex-grow flex justify-around">
        <Typography variant="body1" component="p">
          {afscDisplay}
        </Typography>
      </div>
    </Card>
  );
};

export { ProfileHeader };
