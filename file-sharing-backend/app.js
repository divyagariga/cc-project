const express = require('express');
const multer = require('multer');
const aws = require('aws-sdk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configure AWS S3 with environment variables
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new aws.S3();
const BUCKET_NAME = 'myawsbucket163';

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Root route to handle basic GET request
app.get('/', (req, res) => {
  res.send("Welcome to the File Uploader API!");
});

// Route to handle file upload and email collection
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const emails = req.body.emails ? JSON.parse(req.body.emails) : [];

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (!emails.length || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: 'No emails provided or invalid email format' });
  }

  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: file.originalname,
    Body: fileStream,
    Metadata: {
        emails: JSON.stringify(emails), // Include emails as metadata
      },  };

  s3.upload(uploadParams, (err, data) => {
    fs.unlinkSync(file.path);
    if (err) {
      return res.status(500).json({ message: 'Error uploading file to S3', error: err });
    }
    res.status(200).json({ message: 'File and emails successfully uploaded to S3', data });
  });
});

// Additional test route
app.get('/api', (req, res) => {
  res.json({ message: "Hello from server!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
