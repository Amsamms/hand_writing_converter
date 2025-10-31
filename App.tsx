import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageCropper } from './components/ImageCropper';
import { ResultDisplay } from './components/ResultDisplay';
import { Button } from './components/Button';
import { processHandwriting } from './services/geminiService';
import { downloadCsv, resizeImage } from './utils/fileUtils';
import type { GeminiResponse } from './types';

const App: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<{ file: File, url: string } | null>(null);
  const [croppedImage, setCroppedImage] = useState<{ file: File, url: string } | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [editableText, setEditableText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setOriginalFile({ file, url: URL.createObjectURL(file) });
    setIsCropping(true);
    setCroppedImage(null);
    setResult(null);
    setError(null);
  };

  const handleCropComplete = (imageBlob: Blob) => {
    if (!originalFile) return;

    const file = new File([imageBlob], originalFile.file.name, { type: imageBlob.type });
    const url = URL.createObjectURL(imageBlob);
    
    setCroppedImage({ file, url });
    setIsCropping(false);
  };

  const handleConvertClick = useCallback(async () => {
    if (!croppedImage) {
      setError("Please select and crop an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Resize the image for performance before sending it to the API
      const resizedBlob = await resizeImage(croppedImage.file, 1024);
      const resizedFile = new File([resizedBlob], croppedImage.file.name, { type: resizedBlob.type });

      const response = await processHandwriting(resizedFile);
      setResult(response);
      setEditableText(response.textContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to process image: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [croppedImage]);
  
  const handleTextChange = (newText: string) => {
    setEditableText(newText);
  };

  const handleDownloadCsv = () => {
    if (result?.isTable && result.tableData) {
      const filename = `handwriting_table_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCsv(result.tableData, filename);
    }
  };

  const handleReset = () => {
    setOriginalFile(null);
    setCroppedImage(null);
    setIsCropping(false);
    setResult(null);
    setEditableText('');
    setError(null);
    setIsLoading(false);
  };

  const handleRecrop = () => {
    setIsCropping(true);
    setCroppedImage(null);
    setResult(null);
    setEditableText('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="relative w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl blur-lg opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-dark-card rounded-2xl shadow-2xl p-6 sm:p-8 w-full transition-all duration-300">
            
            {!originalFile && (
                <ImageUploader onImageSelect={handleImageSelect} />
            )}
            
            {originalFile && isCropping && (
                <ImageCropper 
                    src={originalFile.url}
                    imageFile={originalFile.file}
                    onCropComplete={handleCropComplete}
                    onCancel={handleReset}
                />
            )}

            {originalFile && !isCropping && croppedImage && (
                <div className="flex flex-col items-center w-full">
                    <div className="w-full max-w-md mb-6 border-2 border-dashed border-gray-600 rounded-lg p-2">
                        <img src={croppedImage.url} alt="Cropped handwriting preview" className="rounded-md w-full h-auto object-contain max-h-80" />
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full justify-center">
                        <Button onClick={handleConvertClick} disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? 'Analyzing...' : 'Convert Handwriting'}
                        </Button>
                        <Button onClick={handleRecrop} variant="secondary" disabled={isLoading} className="w-full sm:w-auto">
                            Re-crop
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
                editableText={editableText}
                onTextChange={handleTextChange}
                onDownloadCsv={handleDownloadCsv}
            />
            </div>
        </main>
        <footer className="text-center py-6 mt-8 text-dark-subtle text-sm opacity-80">
          <p>Made by amsamms. Powered by the Gemini API.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;