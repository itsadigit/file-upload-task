import React, { useState } from "react";
import axios from "axios";
import "./FileUpload.css";
import { toast } from "react-toastify";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState(""); 
  const [retrievalFileId, setRetrievalFileId] = useState(""); 
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState(""); 
  const [audioUrl, setAudioUrl] = useState(null); 
  const [videoUrl, setVideoUrl] = useState(null); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : ""); 
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose a file to upload!");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "audio/mpeg",
      "video/mp4",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only images (JPEG, PNG, GIF), PDFs, audio (MP3), or video (MP4) files are allowed!"
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted); // Update progress state
          },
        }
      );

      toast.success("File uploaded successfully!");
      setUploadProgress(0);
      setUploadedFileId(response.data.file_id);
      console.log(response.data);
      // alert('File uploaded successfully');
    } catch (error) {
      toast.error("Backend Server error: failed to upload file!");
      setUploadProgress(0);
      console.error("Error uploading file:", error);
    }
  };

  const handleRetrieve = async () => {

    if (!retrievalFileId) {
      toast.error("Please enter file id to retrieve!");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/file/${retrievalFileId}`,
        {
          responseType: "blob",
        }
      );

      const url = URL.createObjectURL(
        new Blob([response.data], { type: response.headers["content-type"] })
      );
      const contentType = response.headers["content-type"];

      setAudioUrl(null);
      setVideoUrl(null);

      const link = document.createElement("a");
      link.href = url;

      if (contentType.includes("image")) {
        window.open(url);
      } else if (contentType.includes('pdf')) {
        link.download = fileName || 'download.pdf';
        link.click();
      } else if (contentType.includes("audio/mpeg")) {
        setAudioUrl(url); // Set the audio URL
      } else if (contentType.includes("video/mp4")) {
        setVideoUrl(url); // Set the video URL
      } else {
        link.click();
      }
      toast.success("File retrieved successfully!");
    } catch (error) {
      toast.error("Backend server error: File retrieval failed!");
      console.error("Error retrieving file:", error);
    }
  };

  return (
    <div className="file-upload-container">
      <h2>Upload and Retrieve Files</h2>

      <label className="custom-file-upload">
        <input type="file" onChange={handleFileChange} />
        Choose File
      </label>
      <span className="file-name">{fileName || "No file selected"}</span>

      <div className="buttons">
        <button onClick={handleUpload}>Upload</button>
      </div>

      {uploadProgress > 0 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${uploadProgress}%` }}>
            {uploadProgress}%
          </div>
        </div>
      )}

      {uploadedFileId && (
        <div className="file-id-display">
          <p>
            Your file ID is: <strong>{uploadedFileId}</strong>
          </p>
        </div>
      )}

      <input
        type="text"
        placeholder="Enter file ID to retrieve"
        value={retrievalFileId}
        onChange={(e) => setRetrievalFileId(e.target.value)}
      />
      <button onClick={handleRetrieve}>Retrieve</button>

      {audioUrl && (
        <div className="audio-player-container">
          <audio controls autoPlay>
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      {videoUrl && (
        <div className="video-player-container">
          <video controls autoPlay width="600">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
