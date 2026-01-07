# Valora - System Architecture

```mermaid
flowchart LR
    User["👤 User"] --> Frontend["💻 Web App<br/>(React)"]
    
    Frontend --> |"1. Upload Resume"| Backend["⚙️ Server<br/>(Node.js)"]
    Frontend --> |"2. Voice Answer"| Backend
    
    Backend --> |"Analyze Resume"| Gemini["🤖 Google<br/>Gemini AI"]
    Backend --> |"Store File"| Storage["💾 Files"]
    
    Gemini --> |"AI Questions"| Backend
    Backend --> |"Questions"| Frontend
    Frontend --> |"Voice Output"| User
    
    Frontend -.-> |"Future: Snapshots"| Backend
    Backend -.-> |"Future: Analysis"| Vision["👁️ Vision AI"]
    Vision -.-> |"Future: Report"| Report["📊 Interview<br/>Report"]
    Report -.-> User
    
    classDef current fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef future fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    
    class User,Frontend,Backend,Gemini,Storage current
    class Vision,Report future
```

## 📖 How It Works

**Current Features:**
1. 📄 **Upload Resume** → User uploads their resume
2. 🤖 **AI Analysis** → Gemini AI reads resume and creates interview questions
3. 🎤 **Live Interview** → User answers questions via voice
4. 🗣️ **Natural Conversation** → AI responds like a real interviewer

**Future Features:**
- 📸 **Webcam Snapshots** → Capture behavior during interview
- 👁️ **Behavior Analysis** → AI analyzes facial expressions & body language
- 📊 **Interview Report** → Get detailed performance report with scores and feedback

## 🎯 Simple Flow

```
User → Upload Resume → AI Creates Questions → Voice Interview → 
[Future: Webcam Analysis → Performance Report]
```

