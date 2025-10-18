'use client';

import { useState, useRef, DragEvent } from 'react';

interface PDFUploadProps {
    onUpload: (file: File) => void;
    isLoading: boolean;
}

export default function PDFUpload({ onUpload, isLoading }: PDFUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                onUpload(file);
            } else {
                alert('Please upload a PDF file');
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onUpload(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${
            isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
            <input
                ref={fileInputRef}
                type='file'
                accept='.pdf'
                onChange={handleFileSelect}
                className='hidden'
                disabled={isLoading}
            />

            <div className='flex flex-col items-center gap-4'>
                <svg
                    className='w-16 h-16 text-gray-400 dark:text-gray-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                    />
                </svg>

                <div className='space-y-2'>
                    <p className='text-lg font-medium text-gray-700 dark:text-gray-300'>
                        {isLoading
                            ? 'Processing PDF...'
                            : 'Drop your PDF here or click to browse'}
                    </p>
                    <p className='text-sm text-gray-500 dark:text-gray-500'>
                        Maximum file size: 5MB
                    </p>
                </div>
            </div>
        </div>
    );
}
