import formidable from 'formidable';
import fs from 'fs';
import Excel from 'exceljs';

export const config = {
  api: {
    bodyParser: false,
  },
};
const saveFile = (file) => {
  const path = `./uploads/${file.name}`;
  const data = fs.readFileSync(file.path);
  fs.writeFileSync(path, data);
  fs.unlinkSync(file.path);
  return path;
};

const deleteFile = async (filepath) => {
  fs.unlinkSync(filepath);
};

const handleExcel = async (req, res) => {
  if (req.method !== 'POST') {
    console.log('not a post');
    return res.status(404).send('');
  }

  const form = new formidable.IncomingForm();
  const workbook = new Excel.Workbook();

  form.parse(req, async function (err, fields, files) {
    let cellValue = undefined;
    const fp = saveFile(files.file);

    workbook.xlsx.readFile(fp).then((openFile) => {
      cellValue = openFile.getWorksheet(1).getCell('A1').value;
      console.log('in promise', cellValue);
      deleteFile(fp);
      res.status(200);
      res.json({ message: cellValue });
    });
  });
};

export default handleExcel;
