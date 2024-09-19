import React from 'react';
import './App.css';
import logo from './logo.svg';
import FileUpload from './components/FileUpload';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>File Upload App</h1>
        <FileUpload />
        <ToastContainer />
      </header>
    </div>
  );
}

export default App;
