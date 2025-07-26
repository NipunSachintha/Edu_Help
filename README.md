# EduHelp - AI-Powered Learning Assistant

EduHelper is a comprehensive AI-powered learning platform that provides personalized coaching through voice interactions. Built with Next.js, Convex, and OpenAI, it offers multiple learning modes to enhance your educational experience.

## 🚀 Features

### AI Coaching Modes
- **Topic-Based Lectures**: Structured learning sessions with AI-powered voice assistance
- **Mock Interviews**: Practice real interview scenarios with intelligent feedback
- **Q&A Preparation**: Interactive question-answer sessions for better understanding
- **Language Learning**: Master new languages with pronunciation guidance
- **Meditation Guide**: Peaceful AI voice guidance for mindfulness practices

### Key Features
- 🎤 **Voice Interaction**: Real-time voice conversations with AI coaches
- 🧠 **Multiple AI Personalities**: Choose from different AI coaches
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔒 **User Authentication**: Secure user management with Stack authentication

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Convex (Database & Backend-as-a-Service)
- **AI**: OpenAI GPT, AWS Polly (Text-to-Speech)
- **Authentication**: Stack
- **Audio**: AssemblyAI, RecordRTC
- **UI Components**: Radix UI, Lucide React Icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (for local Convex development)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd ai-coaching-assistant
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# AWS Configuration (for text-to-speech)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region

# AssemblyAI (for speech-to-text)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# Stack Authentication
NEXT_PUBLIC_STACK_PUBLIC_KEY=your_stack_public_key
STACK_SECRET_KEY=your_stack_secret_key
```

### 4. Set Up Convex (Backend)

#### Option A: Using Convex Cloud (Recommended)
1. Sign up at [convex.dev](https://convex.dev)
2. Create a new project
3. Copy your deployment URL to `NEXT_PUBLIC_CONVEX_URL`

#### Option B: Local Development with Docker
```bash
# Start Convex backend locally
docker-compose up -d
```

### 5. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
ai-coaching-assistant/
├── app/                    # Next.js app directory
│   ├── (main)/            # Main application routes
│   │   ├── dashboard/     # Dashboard page and components
│   │   ├── discussion-room/ # AI conversation interface
│   │   └── view-summary/  # Conversation summaries
│   ├── api/               # API routes
│   └── _context/          # React context providers
├── components/            # Reusable UI components
├── convex/               # Convex backend functions and schema
├── services/             # Business logic and configurations
└── public/               # Static assets
```

## 🎯 Usage Guide

### Getting Started
1. **Sign Up/Login**: Use the authentication system to create an account
2. **Access Dashboard**: Navigate to the dashboard to see all available features
3. **Choose a Mode**: Select from the 5 different AI coaching modes
4. **Start Learning**: Begin your personalized AI coaching session

### AI Coaching Modes

#### Topic-Based Lectures
- Perfect for structured learning on any subject
- AI delivers engaging lectures with follow-up questions
- Receive comprehensive notes after each session

#### Mock Interviews
- Practice real interview scenarios
- Get constructive feedback on your responses
- Improve your interview skills with AI guidance

#### Q&A Preparation
- Interactive question-answer sessions
- Critical thinking development
- Personalized feedback on your understanding

#### Language Learning
- Pronunciation guidance and vocabulary tips
- Interactive language exercises
- Progress tracking for language acquisition

#### Meditation Guide
- Peaceful AI voice guidance
- Breathing techniques and mindfulness practices
- Relaxing meditation sessions

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Convex (if using local development)
npx convex dev       # Start Convex development server
```

### Adding New Features

1. **New AI Coaching Mode**: Add to `services/Options.jsx`
2. **UI Components**: Create in `components/ui/`
3. **Backend Logic**: Add to `convex/` directory
4. **API Routes**: Create in `app/api/`


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

