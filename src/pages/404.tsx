import { Typography } from '@mui/material';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import Link from 'next/link';
import 'twin.macro';

function Custom404() {
  return (
    <div tw="h-screen w-screen bg-[#393D3F] flex flex-col items-center justify-between pt-40 pb-10">
      <div tw="flex flex-col items-center">
        <img alt="Cascade 404" height="285" width="870" src="/img/cascade404.png" />

        <div tw="flex flex-col items-center pt-32 space-y-5">
          <Typography color="white" variant="h5">
            Perhaps you meant to access
          </Typography>

          <Link href="/Tempest">
            <Typography color="white" variant="h3" sx={{ fontStyle: 'italic', cursor: 'pointer' }}>
              TEMPEST
            </Typography>
          </Link>
        </div>
      </div>
      <div>
        <img alt="Cascade 404" src="/img/poweredbytron.png" />
      </div>
    </div>
  );
}

export default withPageAuth(Custom404);
