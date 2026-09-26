import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Loader2,
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';
import { propertyAPI } from '../services/api';

export default function ExcelUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setResult(null);
    if (!selectedFile) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setError('Please select a valid Excel spreadsheet (.xlsx, .xls) or CSV file (.csv).');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15 MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a spreadsheet file first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await propertyAPI.bulkUpload(file);
      setResult(res);
      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and import properties.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Bulk Import via Excel / CSV</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Import hundreds of hotels, banquet halls & luxury stays in seconds.
            </p>
          </div>
        </div>

        {/* Success State */}
        {result ? (
          <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Import Successful!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">{result.message}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mt-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{result.count} properties added to your inventory</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Upload Another File
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md"
              >
                Done & View Inventory
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Drag & Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleChange}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to ingest
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-700">
                      Click to upload or drag & drop spreadsheet
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supports Excel (<code className="bg-slate-100 px-1 rounded">.xlsx</code>, <code className="bg-slate-100 px-1 rounded">.xls</code>) or <code className="bg-slate-100 px-1 rounded">.csv</code> (up to 15 MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Template Download Section */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Need the spreadsheet template?</span>
                <span className="text-[11px] text-slate-500 block">
                  Includes City, State, Hotel Name, Category, Price Range, and Event tags.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => propertyAPI.downloadTemplate('xlsx')}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>.XLSX</span>
                </button>
                <button
                  type="button"
                  onClick={() => propertyAPI.downloadTemplate('csv')}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>.CSV</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || loading}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                  !file || loading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-98'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing & Ingesting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import Properties</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
