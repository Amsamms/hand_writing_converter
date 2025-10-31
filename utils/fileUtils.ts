
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
