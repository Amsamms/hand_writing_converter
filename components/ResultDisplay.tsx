import React from 'react';
import type { GeminiResponse } from '../types';
import { Spinner } from './Spinner';
import { Button } from './Button';

interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  result: GeminiResponse | null;
  onDownloadCsv: () => void;
}

const CsvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, result, onDownloadCsv }) => {
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

  return (
    <div className="mt-8 w-full animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-dark-text">Conversion Result</h2>
            {result.isTable && (
                <Button onClick={onDownloadCsv} size="sm">
                    <CsvIcon />
                    Download CSV
                </Button>
            )}
      </div>
      <div className="p-4 sm:p-6 bg-gray-800/50 rounded-lg border border-gray-700 max-h-[50vh] overflow-y-auto">
        <pre className="text-dark-text whitespace-pre-wrap font-sans text-base leading-relaxed">
          {result.textContent}
        </pre>
      </div>
    </div>
  );
};