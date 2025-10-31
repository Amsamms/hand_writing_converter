import React, { useState, useEffect } from 'react';
import type { GeminiResponse } from '../types';
import { Spinner } from './Spinner';
import { Button } from './Button';

interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  result: GeminiResponse | null;
  editableText: string;
  onTextChange: (newText: string) => void;
  onDownloadCsv: () => void;
}

const CsvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, result, editableText, onTextChange, onDownloadCsv }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy Text');

  // Reset copy button text if the result changes
  useEffect(() => {
    setCopyButtonText('Copy Text');
  }, [result]);
  
  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center text-center">
        <Spinner />
        <p className="mt-4 text-lg text-dark-subtle">Analyzing your handwriting...</p>
        <p className="text-sm text-gray-500">This might take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
        <h3 className="font-bold">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }
  
  const handleCopyClick = () => {
    if (editableText) {
      navigator.clipboard.writeText(editableText);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy Text');
      }, 2000);
    }
  };

  return (
    <div className="mt-8 w-full animate-fade-in" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-dark-text">Conversion Result</h2>
            <div className="flex items-center gap-4">
                 <Button onClick={handleCopyClick} size="sm" variant="secondary">
                    <CopyIcon />
                    {copyButtonText}
                </Button>
                {result.isTable && (
                    <Button onClick={onDownloadCsv} size="sm">
                        <CsvIcon />
                        Download CSV
                    </Button>
                )}
            </div>
      </div>
      <div className="p-4 sm:p-6 bg-dark-bg/50 rounded-lg border border-gray-700/50 max-h-[50vh] overflow-y-auto">
        <textarea
          className="w-full min-h-[250px] bg-transparent text-dark-text whitespace-pre-wrap font-mono text-base leading-relaxed resize-y focus:outline-none"
          value={editableText}
          onChange={(e) => onTextChange(e.target.value)}
          aria-label="Editable conversion result"
        />
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation-name: fadeIn; }
      `}</style>
    </div>
  );
};