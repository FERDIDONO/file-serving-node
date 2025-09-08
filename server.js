const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable = require('formidable');

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/upload') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>Upload a File</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
          <input type="file" name="file" />
          <button type="submit">Upload</button>
        </form>
      `);
    } else {
      let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>', 'utf8');
          } else {
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
          }
        } else {
          res.writeHead(200, { 'Content-Type': mime.lookup(filePath) || 'application/octet-stream' });
          res.end(content, 'utf8');
        }
      });
    }
  } else if (req.method === 'POST' && req.url === '/upload') {

    const form = formidable({ multiples: false, uploadDir: path.join(__dirname, 'uploads'), keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error uploading file');
        return;
      }

      const allowedTypes = ['.txt', '.jpg', '.png'];
      const fileExt = path.extname(files.file[0].originalFilename);

      if (!allowedTypes.includes(fileExt.toLowerCase())) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('File type not allowed');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('File uploaded successfully!');
    });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
