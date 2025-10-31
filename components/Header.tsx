import React from 'react';

const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z" />
        <path d="M22 12l-3 3-3-3 3-3 3 3z" />
        <path d="M12 22l-3-3-3 3 3 3 3-3z" />
        <path d="M2 12l-3 3-3-3 3-3 3 3z" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl mx-auto text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                Handwriting Hero
            </h1>
        </div>
      <p className="text-lg text-dark-subtle max-w-2xl mx-auto">
        Instantly transform handwritten notes and tables into digital text and downloadable spreadsheets.
      </p>
    </header>
  );
};