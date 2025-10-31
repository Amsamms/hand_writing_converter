
import React from 'react';

const PenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl mx-auto text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
            <PenIcon />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
                Handwriting Hero
            </h1>
        </div>
      <p className="text-lg text-dark-subtle">
        Convert handwritten notes and tables into digital text and spreadsheets.
      </p>
    </header>
  );
};
