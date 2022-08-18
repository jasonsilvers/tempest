import { Breadcrumbs, Link } from '@mui/material';
import NextLink from 'next/link';
import 'twin.macro';

export const BreadCrumbs = ({ text }: { text: string }) => {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <NextLink href={'/Dashboard'}>
        <Link tw="cursor-pointer" underline="hover" color="inherit">
          Dashboard
        </Link>
      </NextLink>
      <p tw="text-secondary">{text}</p>
    </Breadcrumbs>
  );
};
