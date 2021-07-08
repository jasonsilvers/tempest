import formidable from 'formidable';
import fs from 'fs';
import Excel from 'exceljs';

// BodyParser is disabled (Next.js enables this by default).
// Otherwise, formidable is unable to process the files and the files are not placed in the request.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Save file function using fs to store a copy of the uploaded file
const saveFile = (file) => {
  const path = `./uploads/${file.name}`;
  const data = fs.readFileSync(file.path);
  fs.writeFileSync(path, data);
  fs.unlinkSync(file.path);
  return path;
};

// clean up function to remove any filepath provided
const deleteFile = async (filepath) => {
  fs.unlinkSync(filepath);
};

const handleExcel = async (req, res) => {
  if (req.method !== 'POST') {
    console.log('not a post');
    return res.status(404).send('');
  }
  // create the form using formidable
  const form = new formidable.IncomingForm();
  // create the Excel workbook form exceljs
  const workbook = new Excel.Workbook();

  // parse the form.
  // this is where all the logic will reside
  form.parse(req, async function (err, fields, files) {
    let cellValue = undefined;
    // check for null file uploaded
    if (!files.file) {
      res.status(400).json({ error: 'No File Sent' });
      return;
    }
    const fp = saveFile(files.file);

    workbook.xlsx.readFile(fp).then((openFile) => {
      cellValue = openFile.getWorksheet(1).getCell('A1').value;
      console.log('in promise', cellValue);
      deleteFile(fp);
      res.status(200);
      res.json({ message: cellValue });
    });
  });

  return res;
};

export default handleExcel;
