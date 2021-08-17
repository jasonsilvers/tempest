import { ChangeEvent, FormEvent, useState } from 'react';
import Excel from 'xlsx';
import fileToArrayBuffer from 'file-to-array-buffer';
import { usePermissions } from '../../hooks/usePermissions';
import { EFuncAction, EResource } from '../../types/global';

// for controlling the files allowed in one place
const acceptableFiles = ['.xlsx'];
// function to get the cell A1 value
// const getA1Value = (workbook) => {
// };
// define the excel workbook outside of the react component

const ExcelPage = () => {
  const { role, isLoading, permissionCheck, user } = usePermissions();
  const [A1, setA1] = useState(null);
  const [file, setFile] = useState(null as File);

  if (isLoading || !user) {
    return <div>Loading excel page</div>;
  }
  const permission = permissionCheck(role, EFuncAction.CREATE_ANY, EResource.UPLOAD);

  if (!permission?.granted) {
    return <div>You do not have permission to the excel upload feature</div>;
  }

  // handle File Change function to stream the file to exceljs
  const handleFileChange = async (e: FormEvent) => {
    e.preventDefault();
    const buffer = (await fileToArrayBuffer(file)) as Buffer;
    const wb = Excel.read(buffer, { type: 'buffer' });
    setA1(wb.Sheets[wb.SheetNames[0]]['A1'].v);
  };

  const clearFile = () => {
    (document.getElementById('file_input') as HTMLInputElement).value = null;
    setA1(null);
  };

  return (
    <main>
      <h1>Excel Client Test Page</h1>
      <form id="uploadForm" encType="multipart/form-data" onSubmit={handleFileChange}>
        <div>
          <input
            id="file_input"
            type="file"
            name="file"
            accept={acceptableFiles.join(', ')}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const newFile = e.target.files[0];
              if (acceptableFiles.some((value) => newFile.name.includes(value))) {
                setFile(newFile);
              }
            }}
          />
          <label htmlFor="file_input">Upload</label>
        </div>
        <button type="submit" disabled={!file}>
          Submit
        </button>
      </form>
      <button onClick={clearFile}>Clear</button>
      {A1 ? <div>Value of Cell A1: {A1}</div> : null}
    </main>
  );
};

export default ExcelPage;
