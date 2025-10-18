import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // Check file type
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'Only PDF files are allowed' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Use pdf2json which works in Node.js
        const PDFParser = (await import('pdf2json')).default;

        return new Promise((resolve) => {
            const pdfParser = new PDFParser();

            pdfParser.on('pdfParser_dataError', (errData: any) => {
                console.error('PDF parsing error:', errData.parserError);
                resolve(
                    NextResponse.json(
                        { error: 'Failed to parse PDF' },
                        { status: 500 }
                    )
                );
            });

            pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
                try {
                    // Extract text from all pages
                    let fullText = '';

                    if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
                        for (const page of pdfData.Pages) {
                            if (page.Texts && Array.isArray(page.Texts)) {
                                for (const text of page.Texts) {
                                    if (text.R && Array.isArray(text.R)) {
                                        for (const r of text.R) {
                                            if (r.T) {
                                                // Decode URI encoded text (with error handling)
                                                try {
                                                    fullText +=
                                                        decodeURIComponent(
                                                            r.T
                                                        ) + ' ';
                                                } catch (e) {
                                                    // If decoding fails, use the raw text
                                                    fullText += r.T + ' ';
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            fullText += '\n';
                        }
                    }

                    const text = fullText.trim();

                    if (!text || text.length === 0) {
                        resolve(
                            NextResponse.json(
                                {
                                    error: 'No text could be extracted from the PDF',
                                },
                                { status: 400 }
                            )
                        );
                        return;
                    }

                    resolve(
                        NextResponse.json({
                            text,
                            pages: pdfData.Pages?.length || 0,
                            fileName: file.name,
                        })
                    );
                } catch (error) {
                    console.error('Text extraction error:', error);
                    resolve(
                        NextResponse.json(
                            { error: 'Failed to extract text from PDF' },
                            { status: 500 }
                        )
                    );
                }
            });

            // Parse the buffer
            pdfParser.parseBuffer(buffer);
        });
    } catch (error) {
        console.error('PDF extraction error:', error);
        return NextResponse.json(
            { error: 'Failed to extract text from PDF' },
            { status: 500 }
        );
    }
}
