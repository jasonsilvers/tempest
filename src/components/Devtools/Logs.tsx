import React, { useMemo } from 'react';
import { DataGrid } from '../../lib/ui';
import 'twin.macro';

const data = {
  logEvents: [
    {
      id: 1,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'API_ACCESS',
      createdAt: '2021-10-20T17:19:34.634Z',
      message: 'URI: /api/login Method: GET',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 2,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'LOGIN',
      createdAt: '2021-10-20T17:19:35.361Z',
      message: 'Successful Login',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 3,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'API_ACCESS',
      createdAt: '2021-10-20T17:19:36.913Z',
      message: 'URI: /api/grants Method: GET',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 4,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'API_ACCESS',
      createdAt: '2021-10-20T17:19:41.294Z',
      message: 'URI: /api/login Method: GET',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 5,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'LOGIN',
      createdAt: '2021-10-20T17:19:41.328Z',
      message: 'Successful Login',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 6,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'API_ACCESS',
      createdAt: '2021-10-20T17:19:41.652Z',
      message: 'URI: /api/grants Method: GET',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 7,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'API_ACCESS',
      createdAt: '2021-10-20T17:19:41.655Z',
      message: 'URI: /api/users Method: GET',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 8,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'API_ACCESS',
      createdAt: '2021-10-20T17:19:50.387Z',
      message: 'URI: /api/users Method: GET',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 9,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'API_ACCESS',
      createdAt: '2021-10-20T17:19:54.396Z',
      message: 'URI: /api/users Method: GET',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
    {
      id: 10,
      userId: '51c59467-516d-48f6-92ea-0623137378c0',
      logEventType: 'API_ACCESS',
      createdAt: '2021-10-20T17:20:05.733Z',
      message: 'URI: /api/users Method: GET',
      user: {
        firstName: 'Joe',
        lastName: 'Smith',
      },
    },
  ],
};

const Logs = () => {
  const columns = useMemo(
    () => [
      {
        headerName: 'User',
        field: 'name',
        valueGetter: (params) => {
          return `${params.row.user.firstName} ${params.row.user.lastName}`;
        },
        flex: 1,
      },
      {
        headerName: 'Type',
        field: 'logEventType',
        flex: 1,
      },
      {
        headerName: 'Message',
        field: 'message',
        flex: 1,
      },
      {
        headerName: 'Created',
        field: 'createdAt',
        flex: 1,
      },
    ],
    []
  );

  return (
    <div tw="flex h-72">
      <DataGrid columns={columns} rows={data.logEvents} />
    </div>
  );
};

export { Logs };
