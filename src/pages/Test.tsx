import React from 'react';
import { Button } from '../lib/ui';
import tw from 'twin.macro';

const AshsButton = tw(Button)`text-red-400 w-24 p-4 text-2xl`;

function TestPage() {
  return <AshsButton variant="contained">Test</AshsButton>;
}

export default TestPage;
