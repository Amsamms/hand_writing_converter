
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to Base64: result is empty."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const downloadCsv = (data: string[][], filename: string) => {
  if (!data || data.length === 0) return;

  const csvContent = data
    .map(row => 
      row
        .map(cell => {
          // Escape quotes by doubling them and wrap cell in quotes if it contains commas or newlines
          const cleanedCell = cell ? cell.toString().replace(/"/g, '""') : '';
          if (cleanedCell.includes(',') || cleanedCell.includes('\n') || cleanedCell.includes('"')) {
            return `"${cleanedCell}"`;
          }
          return cleanedCell;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Resizes an image file to a maximum dimension while maintaining aspect ratio.
 * @param file The image file to resize.
 * @param maxDimension The maximum width or height of the resized image.
 * @returns A Promise that resolves with the resized image as a Blob.
 */
export const resizeImage = (file: File, maxDimension: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        }, file.type);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
