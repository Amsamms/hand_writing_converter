import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { Button } from './Button';

interface ImageCropperProps {
  src: string;
  imageFile: File;
  onCropComplete: (imageBlob: Blob) => void;
  onCancel: () => void;
}

/**
 * Creates a cropped image blob from a source image file and a crop selection,
 * while respecting EXIF orientation.
 */
async function getCroppedImg(
    imageFile: File,
    imageElement: HTMLImageElement,
    crop: PixelCrop,
): Promise<Blob> {
    // createImageBitmap can take a file/blob and an options object.
    // 'from-image' will respect EXIF orientation.
    const bitmap = await createImageBitmap(imageFile, { imageOrientation: 'from-image' });

    // The crop is in display-image pixel coordinates.
    // We need to scale these coordinates to the bitmap's dimensions.
    const scaleX = bitmap.width / imageElement.width;
    const scaleY = bitmap.height / imageElement.height;

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(cropWidth);
    canvas.height = Math.floor(cropHeight);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return Promise.reject(new Error('Failed to get canvas context'));
    }

    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped portion of the bitmap onto the canvas.
    ctx.drawImage(
      bitmap,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    // Release bitmap resources.
    bitmap.close();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/png',
        1
      );
    });
}


export const ImageCropper: React.FC<ImageCropperProps> = ({ src, imageFile, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    // Set initial crop to full image in pixels
    setCrop({
        unit: 'px',
        x: 0,
        y: 0,
        width,
        height,
    });
  }

  const handleConfirmCrop = async () => {
    if (imgRef.current && imageFile && crop?.width && crop?.height) {
      try {
        const croppedBlob = await getCroppedImg(imageFile, imgRef.current, crop);
        onCropComplete(croppedBlob);
      } catch (e) {
        console.error("Cropping failed", e);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <h2 className="text-2xl font-bold text-dark-text mb-2">Crop your Image</h2>
      <p className="text-dark-subtle mb-6 text-center">Drag the selection to focus on the handwriting.</p>
      
      <div className="max-w-full flex justify-center mb-6 bg-dark-bg/30 rounded-lg p-2 border border-gray-700/50">
        <ReactCrop
          crop={crop}
          onChange={(pixelCrop) => setCrop(pixelCrop)}
          aspect={undefined} // Free crop
        >
          <img 
            ref={imgRef} 
            src={src} 
            onLoad={onImageLoad} 
            alt="Crop preview" 
            style={{ maxHeight: '60vh', objectFit: 'contain' }} 
          />
        </ReactCrop>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Button onClick={handleConfirmCrop} disabled={!crop?.width || !crop?.height}>
          Confirm Crop
        </Button>
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
      <style>{`
        .ReactCrop__crop-selection {
          border: 2px solid #6366f1;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation-name: fadeIn; }
      `}</style>
    </div>
  );
};