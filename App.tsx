
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Button } from './components/Button';
import { processHandwriting } from './services/geminiService';
import { downloadCsv } from './utils/fileUtils';
import type { GeminiResponse } from './types';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleConvertClick = useCallback(async () => {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await processHandwriting(imageFile);
      setResult(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to process image: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleDownloadCsv = () => {
    if (result?.isTable && result.tableData) {
      const filename = `handwriting_table_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCsv(result.tableData, filename);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col items-center">
        <div className="bg-dark-card rounded-xl shadow-2xl p-6 sm:p-8 w-full transition-all duration-300">
          {!imageUrl && (
            <ImageUploader onImageSelect={handleImageSelect} />
          )}
          
          {imageUrl && (
            <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-md mb-6 border-2 border-dashed border-gray-600 rounded-lg p-2">
                <img src={imageUrl} alt="Handwriting preview" className="rounded-md w-full h-auto object-contain max-h-80" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                 <Button onClick={handleConvertClick} disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? 'Analyzing...' : 'Convert Handwriting'}
                </Button>
                <Button onClick={handleReset} variant="secondary" disabled={isLoading} className="w-full sm:w-auto">
                    Upload Another
                </Button>
              </div>
            </div>
          )}

          <ResultDisplay
            isLoading={isLoading}
            error={error}
            result={result}
            onDownloadCsv={handleDownloadCsv}
          />
        </div>
        <footer className="text-center py-6 mt-8 text-dark-subtle text-sm">
          <p>Powered by Gemini API</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
