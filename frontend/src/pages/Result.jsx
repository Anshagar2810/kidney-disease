import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      navigate('/upload');
    }
  }, [location, navigate]);

  if (!location.state) return null;

  const { prediction, confidence, report, imageUrl } = location.state;
  const isTumor = prediction.toLowerCase() === 'tumor';
  const confidencePercent = (confidence * 100).toFixed(1);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/upload" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-6 md:mb-8 transition-colors group">
          <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          Analyze Another Image
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Image & Core Result */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">Analyzed Image</h3>
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-6 shadow-inner relative group">
                <img src={imageUrl} alt="Analyzed" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Diagnostic Prediction</p>
                  <div className={clsx(
                    "inline-flex items-center px-4 py-2 rounded-xl text-lg font-bold",
                    isTumor ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                  )}>
                    {isTumor ? <AlertTriangle className="mr-2 h-5 w-5" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                    {prediction}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">AI Confidence</span>
                    <span className="font-bold text-slate-700">{confidencePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <motion.div 
                      className={clsx(
                        "h-3 rounded-full",
                        isTumor ? "bg-red-500" : "bg-green-500"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidencePercent}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: AI Report */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 h-full overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary shadow-inner">
                    <Activity className="h-5 w-5 animate-pulse" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">Comprehensive AI Report</h2>
                </div>
                <span className="hidden sm:inline-block text-xs font-medium px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full shadow-sm">
                  Powered by Mistral 7B
                </span>
              </div>
              
              <div className="p-6 md:p-8 flex-1 overflow-y-auto prose prose-sm md:prose-base prose-slate max-w-none prose-headings:text-slate-900 prose-strong:text-primary">
                <ReactMarkdown>{report}</ReactMarkdown>
                
                <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <p className="text-sm text-yellow-800 m-0 flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 shrink-0 text-yellow-600" />
                    <strong>Disclaimer:</strong> This report is generated by Artificial Intelligence and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
