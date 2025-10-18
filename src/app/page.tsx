'use client';

import { useState, useRef, useEffect } from 'react';
import PDFUpload from '@/components/PDFUpload';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { Message, PDFData } from '@/types';

export default function Home() {
    const [pdfData, setPdfData] = useState<PDFData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handlePDFUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/extract-pdf', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process PDF');
            }

            setPdfData(data);
            setMessages([
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `Great! I've successfully loaded "${data.fileName}" (${data.pages} pages). What would you like to know about this document?`,
                    timestamp: new Date(),
                },
            ]);
        } catch (err: any) {
            setError(err.message || 'Failed to upload PDF');
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSendMessage = async (question: string) => {
        if (!pdfData || isChatLoading) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: question,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsChatLoading(true);
        setError(null);

        // Create a placeholder message for streaming
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        try {
            // Prepare conversation history for context
            const conversationHistory = messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question,
                    pdfText: pdfData.text,
                    conversationHistory,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body');
            }

            let fullContent = '';
            let buffer = '';

            const processStream = async () => {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        // Final update with any remaining buffer
                        if (buffer) {
                            fullContent += buffer;
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === assistantMessageId
                                        ? { ...msg, content: fullContent }
                                        : msg
                                )
                            );
                        }
                        break;
                    }

                    // Decode the chunk
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;
                    fullContent += chunk;

                    // Update UI immediately with each chunk
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: fullContent }
                                : msg
                        )
                    );

                    buffer = '';
                }
            };

            await processStream();
        } catch (err: any) {
            setError(err.message || 'Failed to get response from AI');
            console.error('Chat error:', err);
            // Remove the empty assistant message on error
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== assistantMessageId)
            );
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleNewPDF = () => {
        setPdfData(null);
        setMessages([]);
        setError(null);
    };

    return (
        <div className='flex flex-col h-screen bg-white dark:bg-gray-900'>
            {/* Header */}
            <header className='flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
                <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                            <svg
                                className='w-5 h-5 text-white'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                />
                            </svg>
                        </div>
                        <h1 className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                            AskPDF
                        </h1>
                    </div>

                    {pdfData && (
                        <div className='flex items-center gap-4'>
                            <div className='hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                                <svg
                                    className='w-4 h-4'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                    />
                                </svg>
                                <span className='font-medium truncate max-w-[200px]'>
                                    {pdfData.fileName}
                                </span>
                                <span className='text-gray-400'>•</span>
                                <span>{pdfData.pages} pages</span>
                            </div>
                            <button
                                onClick={handleNewPDF}
                                className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'>
                                New PDF
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className='flex-1 overflow-hidden'>
                {!pdfData ? (
                    // Upload view
                    <div className='h-full flex items-center justify-center p-4'>
                        <div className='max-w-2xl w-full space-y-6'>
                            <div className='text-center space-y-3'>
                                <h2 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
                                    Welcome to AskPDF
                                </h2>
                                <p className='text-gray-600 dark:text-gray-400 text-lg'>
                                    Upload a PDF and ask questions about its
                                    content
                                </p>
                            </div>

                            <PDFUpload
                                onUpload={handlePDFUpload}
                                isLoading={isUploading}
                            />

                            {error && (
                                <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
                                    <div className='flex items-start gap-3'>
                                        <svg
                                            className='w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                            />
                                        </svg>
                                        <p className='text-red-800 dark:text-red-300 text-sm'>
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Chat view
                    <div className='h-full flex flex-col'>
                        {/* Messages */}
                        <div className='flex-1 overflow-y-auto'>
                            {messages.map((message, index) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    isStreaming={
                                        isChatLoading &&
                                        index === messages.length - 1 &&
                                        message.role === 'assistant'
                                    }
                                />
                            ))}

                            {error && (
                                <div className='max-w-3xl mx-auto px-4 py-4'>
                                    <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
                                        <div className='flex items-start gap-3'>
                                            <svg
                                                className='w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'>
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                                />
                                            </svg>
                                            <p className='text-red-800 dark:text-red-300 text-sm'>
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <ChatInput
                            onSend={handleSendMessage}
                            isLoading={isChatLoading}
                            disabled={!pdfData}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
