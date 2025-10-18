'use client';

import { Message } from '@/types';

interface ChatMessageProps {
    message: Message;
    isStreaming?: boolean;
}

export default function ChatMessage({
    message,
    isStreaming = false,
}: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div
            className={`
        flex w-full py-6 px-4
        ${isUser ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-800/50'}
      `}>
            <div className='max-w-3xl w-full mx-auto flex gap-6'>
                {/* Avatar */}
                <div className='flex-shrink-0'>
                    <div
                        className={`
              w-8 h-8 rounded-sm flex items-center justify-center font-medium text-white
              ${
                  isUser
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-green-500 to-emerald-600'
              }
            `}>
                        {isUser ? 'U' : 'AI'}
                    </div>
                </div>

                {/* Message Content */}
                <div className='flex-1 space-y-2 overflow-hidden'>
                    <div className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                        {isUser ? 'You' : 'AskPDF Assistant'}
                    </div>
                    <div className='text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words'>
                        {message.content}
                        {isStreaming && (
                            <span className='inline-block w-1.5 h-5 bg-gray-800 dark:bg-gray-200 ml-1 animate-pulse' />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
