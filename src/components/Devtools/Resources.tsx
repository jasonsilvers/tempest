import { DataGrid, GridColumns } from '@mui/x-data-grid';
import 'twin.macro';
import { useResources } from '../../hooks/api/resources';

export const Resources = () => {
  const resourceQuery = useResources();

  const columns: GridColumns = [
    { field: 'id', headerName: 'Id', flex: 1, editable: true },
    { field: 'name', headerName: 'Name', flex: 1, editable: true },
  ];

  if (resourceQuery.isLoading) {
    return <div>...loading</div>;
  }

  return (
    <div tw="h-[560px]">
      <DataGrid rows={resourceQuery.data} columns={columns} />
    </div>
  );
};
