import React, { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import 'twin.macro';
import { useQuery } from 'react-query';
import axios from 'axios';
import { EUri } from '../../const/enums';
import { LogEventDTO } from '../../types';

const Logs = () => {
  const logEventQuery = useQuery('logEvents', async () => {
    return axios.get<LogEventDTO>(EUri.LOGS).then((response) => response.data.logEvents);
  });

  const columns = useMemo(
    () => [
      {
        headerName: 'User',
        field: 'name',
        valueGetter: (params) => {
          return `${params.row.user?.firstName} ${params.row.user?.lastName}`;
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

  if (logEventQuery?.isLoading) {
    return <div>...loading</div>;
  }

  return (
    <div tw="flex h-96">
      <DataGrid columns={columns} rows={logEventQuery?.data} />
    </div>
  );
};

export { Logs };
