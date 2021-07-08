import axios from 'axios';
import { useState } from 'react';

const ExcelPage = () => {
  const [state, setState] = useState(null);

  const handleFileChange = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', e.target[0].files[0]);
    axios
      .post('/api/excel/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => setState(res.data.message));
  };

  return (
    <main>
      <h1>Excel Upload Test Page</h1>
      <form id="uploadForm" encType="multipart/form-data" onSubmit={handleFileChange}>
        <input type="file" name="file" />
        <input type="submit" value="Upload" name="submit" />
      </form>
      {state ? <div>Value of Cell A1: {state}</div> : null}
    </main>
  );
};

export default ExcelPage;
