# AskPDF 📄

A modern, ChatGPT-style interface for asking questions about PDF documents using AI. Upload any PDF and have intelligent conversations about its content, powered by OpenAI's GPT models.

![AskPDF Interface](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- **📤 Drag & Drop Upload**: Easy PDF upload with drag-and-drop support (max 5MB)
- **🤖 AI-Powered Q&A**: Ask questions and get intelligent answers based on PDF content
- **💬 Chat Interface**: Modern, ChatGPT-style conversation interface
- **🔄 Context Awareness**: Maintains conversation history for contextual responses
- **⚡ Real-time Processing**: Instant PDF text extraction and AI responses
- **🎨 Modern UI**: Beautiful, responsive design with dark mode support
- **⏳ Loading States**: Clear feedback during PDF processing and AI responses
- **❌ Error Handling**: Comprehensive error handling with user-friendly messages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))

### Installation

1. Clone the repository:
```bash
cd my-apep
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 How to Use

1. **Upload a PDF**: 
   - Click the upload area or drag and drop a PDF file (max 5MB)
   - Wait for the PDF to be processed

2. **Ask Questions**:
   - Type your question in the chat input at the bottom
   - Press Enter to send (Shift+Enter for new line)
   - The AI will respond based on the PDF content

3. **Continue the Conversation**:
   - Ask follow-up questions
   - The AI remembers the conversation context
   - Click "New PDF" to start over with a different document

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: OpenAI API (GPT-3.5-turbo)
- **PDF Processing**: pdf-parse
- **UI Components**: Custom React components

## 📁 Project Structure

```
my-apep/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts          # OpenAI chat endpoint
│   │   │   └── extract-pdf/
│   │   │       └── route.ts          # PDF text extraction endpoint
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main chat interface
│   ├── components/
│   │   ├── ChatInput.tsx             # Message input component
│   │   ├── ChatMessage.tsx           # Message display component
│   │   └── PDFUpload.tsx             # PDF upload component
│   └── types/
│       └── index.ts                  # TypeScript types
├── .env.local                        # Environment variables (create this)
├── package.json
└── README.md
```

## 🔒 Security Notes

- The `.env.local` file is gitignored to keep your API key safe
- Never commit your OpenAI API key to version control
- The API key is only used server-side in API routes
- PDF files are processed in memory and not stored permanently

## ⚙️ Configuration

### OpenAI Model

By default, the app uses `gpt-3.5-turbo`. To change the model, edit:

```typescript
// src/app/api/chat/route.ts
const completion = await openai.chat.completions.create({
  model: 'gpt-4', // Change this to your preferred model
  // ...
});
```

### File Size Limit

To change the 5MB upload limit, edit:

```typescript
// src/app/api/extract-pdf/route.ts
const maxSize = 5 * 1024 * 1024; // Change this value
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI inspired by [ChatGPT](https://chat.openai.com/)
- Powered by [OpenAI API](https://openai.com/api/)

## 📧 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ using Next.js and OpenAI
