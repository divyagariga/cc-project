import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [emails, setEmails] = useState(['']);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleEmailChange = (index, event) => {
    const newEmails = [...emails];
    newEmails[index] = event.target.value;
    setEmails(newEmails);
  };

  const handleAddEmail = () => {
    if (emails.length < 5) {
      setEmails([...emails, '']);
    }
  };

  const handleRemoveEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    if (emails.some(email => !email)) {
      alert('Please fill out all email fields or remove empty ones.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('emails', JSON.stringify(emails));

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        // const response = await axios.post('http://18.188.87.124:5000/upload', formData, {
          headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('File and emails successfully uploaded!');
      console.log('Response:', response.data);
    } catch (error) {
      setUploadStatus('Error uploading file and emails');
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React File Uploader with Emails</h1>
        <input type="file" onChange={handleFileChange} />
        {selectedFile && <p>Selected File: {selectedFile.name}</p>}
        
        {emails.map((email, index) => (
          <div key={index}>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => handleEmailChange(index, e)}
            />
            {emails.length > 1 && (
              <button type="button" onClick={() => handleRemoveEmail(index)}>Remove</button>
            )}
          </div>
        ))}
        
        {emails.length < 5 && (
          <button type="button" onClick={handleAddEmail}>Add Another Email</button>
        )}

        <button onClick={handleFileUpload}>Upload File</button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </header>
    </div>
  );
}

export default App;
