import { string } from 'joi';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { DataGrid, SearchBar } from '../../lib/ui';
import { useQuery, useQueryClient } from 'react-query';
import { ERole, EUri } from '../../const/enums';
import { user, LogEvent } from '.prisma/client';
import { UserWithAll } from '../../repositories/userRepo';
import { LogEventDTO, UsersDTO } from '../../types';

const LogEvents = () => {
  const queryClient = useQueryClient();

  const userQuery = useQuery<User[]>('ID', () =>
    axios.get<UsersDTO>(EUri.USERS).then((response) => response.data.dodId)
  );

  const logEventQuery = useQuery<LogEvent[]>('LogEvent', () =>
    axios.get<LogEventDTO>(EUri.LOGS).then((response) => response.data.logEvents)
  );

  return <div></div>;
};

const columns = [
  { field: 'id', headerName: 'ID', width: 30 },
  {
    field: 'dodId',
    headerName: 'DOD ID',
    width: 150,
    editable: true,
  },
  {
    field: 'userId',
    headerName: 'User ID',
    width: 150,
    editable: true,
  },
  {
    field: 'logEventType',
    headerName: 'Log Event Type',
    width: 80,
    editable: true,
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    width: 160,
    editable: true,
  },
  {
    field: 'message',
    headerName: 'Message',
    width: 160,
    editable: true,
  },
];

const rows = [
  { id: 1, dodId: 'Snow', userId: 'Jon', logEventType: '', createdAt: '', message: '' },
  { id: 2, dodId: 'Snow', userId: 'Jon', logEventType: '', createdAt: '', message: '' },
  { id: 3, dodId: 'Snow', userId: 'Jon', logEventType: '', createdAt: '', message: '' },
  { id: 4, dodId: 'Snow', userId: 'Jon', logEventType: '', createdAt: '', message: '' },
  { id: 5, dodId: 'Snow', userId: 'Jon', logEventType: '', createdAt: '', message: '' },
];

const DevDataGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // const [searchResults, setSearchResults] = useState([])
  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  //updates datagrid when characters are typed into search bar
  // useEffect(() => {
  //     const results = columns.filter(column =>
  //         column.toLowerCase().includes(searchTerm.toLocaleLowerCase())
  //         )
  //         // setSearchResults(results)
  // }, [searchTerm])

  return (
    <div>
      {/* <SearchBar
            value={''}
            onchange={(searchTerm) => setSearchTerm({value: searchTerm})}
            cancelOnEscape={true}
            placeholder='Search'
            
            /> */}
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};

export { DevDataGrid };
