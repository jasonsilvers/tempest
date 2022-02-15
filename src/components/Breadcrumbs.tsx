import { Breadcrumbs, Link, Typography } from '@mui/material';
import NextLink from 'next/link';

export const BreadCrumbs = () => {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <NextLink href={'/Dashboard'}>
        <Link underline="hover" color="inherit">
          Dashboard
        </Link>
      </NextLink>
      <Typography color="text.primary">Member Profile</Typography>
    </Breadcrumbs>
  );
};
