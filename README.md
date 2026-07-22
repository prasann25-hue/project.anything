# CareerPilot AI — Real-Time AI Interview Preparation Coach

CareerPilot AI is a full-stack Generative AI application designed to help undergraduate students and entry-level developers prepare for technical mock interviews. Powered by Google's official Gemini API and Supabase, it generates tailored questions based on a student's experience, evaluates responses with custom weights, renders real-time status updates via Supabase WebSockets, and compiles custom 7-day preparation study plans.

---

## 🛠️ Technology Stack

- **Frontend**: React (TypeScript), Tailwind CSS v4, React Router v6, React Hook Form, Zod, and Lucide Icons.
- **Backend**: Node.js, Express.js (TypeScript), Helmet, CORS, and Express Rate Limiters.
- **Database / Auth**: Supabase (PostgreSQL, Row Level Security, and Realtime Listeners).
- **AI Engine**: Google Gemini API via the official `@google/genai` SDK.

---

## 📁 Suggested Folder Structure

```
c:/Users/prasn/project1/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI widgets & Layouts
│   │   ├── context/            # AuthContext.tsx for Supabase
│   │   ├── hooks/              # useInterviewRealtime.ts
│   │   ├── lib/                # api.ts (HTTP client), supabaseClient.ts
│   │   ├── pages/              # Landing, Onboarding, Dashboard, Live mock, Reports, History, Study Plan, Profile
│   │   ├── validation/         # Zod validation models copy
│   │   ├── App.tsx             # Route declarations
│   │   ├── index.css           # Tailwind + Custom fonts setup
│   │   └── main.tsx            # Mounts App
│   ├── vite.config.ts          # Integrates Tailwind v4 Vite compiler
│   └── package.json
│
├── server/                     # Node/Express Backend
│   ├── src/
│   │   ├── controllers/        # Express handlers (Profile, Dashboard, Interview, StudyPlan, Progress)
│   │   ├── middleware/         # auth.ts (Supabase JWT verifier)
│   │   ├── routes/             # API routes
│   │   ├── services/           # gemini.ts (official SDK wrapper), supabase.ts (admin client)
│   │   ├── validation/         # schemas.ts (Zod models)
│   │   ├── app.ts              # Express initialization
│   │   └── server.ts           # Listen wrapper
│   ├── tsconfig.json
│   └── package.json
│
├── supabase/
│   └── migrations/
│       └── 20260722000000_init.sql # SQL migration script
│
└── README.md
```

---

## ⚙️ Environment Variables Required

Create `.env` files in both directories according to the templates:

### Backend (`server/.env`)
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # Bypasses RLS for admin evaluations writes
GEMINI_API_KEY=your-google-gemini-api-key
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:5000
```

*Note: Do not commit actual `.env` files.*

---

## 🚀 Setup & Installation Steps

### 1. Database (Supabase) Setup
1. Create a new project in the [Supabase Dashboard](https://supabase.com/).
2. Navigate to the **SQL Editor** tab in the dashboard.
3. Open `supabase/migrations/20260722000000_init.sql`.
4. Copy the entire query content, paste it into the editor, and click **Run**.
5. This initializes the tables (`profiles`, `interview_sessions`, `interview_questions`, `interview_answers`, `study_plans`, `progress`), enables **Row Level Security (RLS)**, binds **RLS Policies**, and configures triggers.
6. Enable **Realtime** on `interview_sessions` under `Database -> Replication` in Supabase to stream status indicators.

### 2. Backend Server Setup
```bash
cd server
npm install
npm run build
```

### 3. Frontend Client Setup
```bash
cd client
npm install
npm run build
```

---

## ⚡ How to Run Locally

Start both the backend server and frontend dev environment:

1. **Start the Express Server**:
   ```bash
   cd server
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

2. **Start the Vite Dev Server**:
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:5173`.

---

## 🧪 Testing & Verification Steps

### Manual Walkthrough
1. **User Sign Up**: Visit `http://localhost:5173/` and click "Sign Up". Register an account.
2. **Onboarding**: Complete the form. Set target role to "Frontend Developer" and difficulty to "Medium". Click complete.
3. **Dashboard Check**: Verify that metrics show "0 Completed" and average score is "N/A".
4. **Mock Configuration**: Click "Start New Interview", choose "React" topic, choose "5 questions", and click Start.
5. **Real-time generation**: Verify that the workspace room shows a pulse loading status: *"Gemini is writing the next question based on your tech-stack..."*
6. **Student answer**: Submit a technical description. Ensure it passes Zod minimum lengths validation.
7. **Immediate Evaluation**: Observe the AI response displaying bulleted hit/missed/incorrect points, score, technical tips, and recommended study revisions.
8. **Final report card**: Finish the mock. Verify the final scorecard calculates overall percentage score, marks strong/weak fields, and suggests 3 revision subjects.
9. **7-Day Plan**: Click "Generate 7-Day Study Plan". Select each day index to inspect your learning checklist and mark days as completed.

---

## ⚠️ Remaining Limitations

1. **Local storage checks**: Completion checklist records on study plans are currently stored in `localStorage` for simplicity.
2. **Mock Gemini responses**: In local offline testing, mock Gemini JSON responses can be used if API keys are absent.
3. **Database connection**: Realtime status requires replication permissions enabled in the Supabase control panel for full synchronization.
