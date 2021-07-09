import { useState } from 'react';
import Excel from 'exceljs';
import fileToArrayBuffer from 'file-to-array-buffer';

// for controlling the files allowed in one place
const acceptableFiles = ['.xlsx'];
// function to get the cell A1 value
const getA1Value = (workbook) => {
  const worksheet = workbook.getWorksheet(1);
  return worksheet.getCell('A1').value;
};
// define the excel workbook outside of the react component
const wb = new Excel.Workbook();

const ExcelPage = () => {
  const [A1, setA1] = useState(null);
  const [file, setFile] = useState(null as File);

  // handle File Change function to stream the file to exceljs
  const handleFileChange = async (e) => {
    e.preventDefault();
    console.log('before buffer');

    const buffer = (await fileToArrayBuffer(file)) as Buffer;
    console.log(buffer);

    wb.xlsx.load(buffer).then((workbook) => setA1(getA1Value(workbook)));
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
            onChange={(e) => {
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
