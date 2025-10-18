import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { question, pdfText, conversationHistory } = await request.json();

        if (!question || !pdfText) {
            return new Response(
                JSON.stringify({ error: 'Question and PDF text are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Build messages array with context
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: `You are a helpful assistant that answers questions about a PDF document. Here is the content of the PDF:

${pdfText}

Please answer questions based on this content. If the answer cannot be found in the document, say so clearly.`,
            },
        ];

        // Add conversation history if exists
        if (conversationHistory && Array.isArray(conversationHistory)) {
            messages.push(...conversationHistory);
        }

        // Add current question
        messages.push({
            role: 'user',
            content: question,
        });

        // Call OpenAI API with streaming
        const stream = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
        });

        // Create a readable stream for the response with proper flushing
        const encoder = new TextEncoder();
        const customStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            // Encode and send each chunk immediately
                            const encoded = encoder.encode(content);
                            controller.enqueue(encoded);
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.error(error);
                }
            },
        });

        return new Response(customStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        });
    } catch (error) {
        console.error('OpenAI API error:', error);

        const err = error as { status?: number; message?: string };
        if (err?.status === 401) {
            return new Response(
                JSON.stringify({ error: 'Invalid OpenAI API key' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                error: err?.message || 'Failed to get response from AI',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
