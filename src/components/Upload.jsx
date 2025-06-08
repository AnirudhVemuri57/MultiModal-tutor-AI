import React, { useState } from 'react';

function Upload({ token }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      console.log('Selected file:', selectedFile.name, selectedFile.type, selectedFile.size);
      setError('');
    } else {
      setError('No file selected');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file (JPG, PNG, PDF, PPT, or PPTX)');
      return;
    }
    if (isUploading) {
      setError('Upload in progress, please wait');
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    console.log('Sending file:', file.name);
    try {
      const response = await fetch('http://localhost:5000/ocr', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setText(data.text);
      setSummary(data.summary);
      setError('');
      setFile(null);
      document.querySelector('input[type="file"]').value = '';
      setIsUploading(false);
    } catch (err) {
      setError(`Failed to process file: ${err.message}`);
      console.error('Upload error:', err);
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Image, PDF, or PowerPoint</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="file"
          accept=".jpg,.jpeg,.png,.pdf,.ppt,.pptx"
          onChange={handleFileChange}
        />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {text && (
        <div>
          <h3>Extracted Text</h3>
          <p>{text}</p> {/* Class applied here */}
          <h3>Summary</h3>
          <p className="ask-text-glow">{summary}</p> {/* Class applied here */}
        </div>
      )}
    </div>
  );
}

export default Upload;