# Respondiq — AI Chatbot Builder SaaS

## What It Is
A white-label AI chatbot builder where business owners upload their documents,
customize the chatbot appearance, and embed it on their website with one line of code.

## Tech Stack
- **Backend:** FastAPI (Python) + Firebase Admin SDK
- **Frontend:** React 19 + Vite + Tailwind CSS
- **Auth:** Firebase Auth (email/password + Google)
- **Database:** Firestore
- **Storage:** Firebase Storage
- **Embeddings:** sentence-transformers (all-MiniLM-L6-v2) on GPU
- **Vector Store:** ChromaDB
- **LLM:** Claude API (Haiku/Sonnet) + Ollama (local)
- **Widget:** Vanilla JS embeddable script

## Core Features
1. User authentication (Firebase Auth)
2. Chatbot CRUD with unique API keys
3. Knowledge base: upload PDF/TXT/DOCX, scrape URLs, paste text
4. RAG engine: document chunking + embedding + retrieval
5. Multi-model streaming chat (Claude + Ollama)
6. Widget customization (colors, position, messages)
7. Embeddable script tag (works on any website)
8. Analytics dashboard (messages, conversations, satisfaction)
9. Conversation history viewer
10. Plan-based usage limits (free/pro/business)

## Pricing Plans
- Free: 1 chatbot, 50 msgs/month, 5 docs
- Pro ($29/mo): 5 chatbots, 2000 msgs/month, 50 docs
- Business ($79/mo): Unlimited chatbots, 10000 msgs/month, 200 docs

## Running Locally
### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # fill in your keys
python main.py
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # fill in Firebase config
npm run dev
```

## Deployment
- Backend: Google Cloud Run
- Frontend: Firebase Hosting
