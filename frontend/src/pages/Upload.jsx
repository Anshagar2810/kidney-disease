import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, X, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      // 1. Predict
      const predictRes = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { prediction, confidence } = predictRes.data;

      // 2. Generate Report
      const reportRes = await axios.post(`${API_URL}/generate-report`, {
        prediction,
        confidence
      });

      const { report } = reportRes.data;

      // 3. Navigate to result
      navigate('/result', {
        state: {
          prediction,
          confidence,
          report,
          imageUrl: previewUrl
        }
      });
      
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.response?.data?.detail || "An error occurred during analysis. Make sure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="px-8 py-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">Upload Hyperspectral Image</h2>
            <p className="mt-2 text-slate-500">Upload a `.png`, `.jpg`, or `.jpeg` file for AI analysis</p>
          </div>

          <div 
            className={clsx(
              "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ease-in-out",
              dragActive ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50 bg-slate-50/50",
              selectedFile && "border-transparent bg-slate-50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />

            <AnimatePresence mode="wait">
              {!selectedFile ? (
                <motion.div
                  key="upload-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center space-y-4"
                >
                  <div className="bg-white p-4 rounded-full shadow-sm">
                    <UploadCloud className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <button 
                      onClick={() => inputRef.current?.click()}
                      className="font-semibold text-primary hover:text-primary-dark focus:outline-none"
                    >
                      Click to upload
                    </button>
                    <span className="text-slate-500"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-slate-400">High-resolution hyperspectral imagery preferred</p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center"
                >
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                  {!isAnalyzing && (
                    <button
                      onClick={clearFile}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                    >
                      <X className="h-5 w-5 text-slate-600" />
                    </button>
                  )}
                  
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <Loader2 className="h-10 w-10 animate-spin mb-4" />
                      <p className="font-medium text-lg">Analyzing Image...</p>
                      <p className="text-sm text-white/80 mt-2">Generating diagnostic report</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-start text-sm"
              >
                <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className={clsx(
                "px-8 py-3 rounded-xl font-medium shadow-sm transition-all flex items-center",
                !selectedFile || isAnalyzing
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark hover:shadow-md active:scale-95"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Processing...
                </>
              ) : (
                <>
                  Analyze Image
                  <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
