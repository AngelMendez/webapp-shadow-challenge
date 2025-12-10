# AI-Enhanced To-Do List Application

A modern, full-stack to-do list application with AI-powered task enhancement, chatbot interface, and WhatsApp integration built for the AI Automation Developer Challenge.

## 🌟 Features

### Core Features
- ✅ **Full CRUD Operations**: Create, read, update, and delete tasks
- 💾 **Persistent Storage**: Tasks stored in Supabase with real-time sync
- 👤 **User Identification**: Simple name/email-based user system
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

### Advanced Features
- 🤖 **AI Task Enhancement**: Tasks are automatically enhanced with AI-generated descriptions and steps
- 💬 **Chatbot Interface**: Manage tasks through natural language conversation
- 📱 **WhatsApp Integration**: Control your tasks via WhatsApp messages
- 🔗 **RESTful API**: Clean API layer for external integrations

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Automation**: N8N Workflows
- **AI**: OpenAI GPT-4 / Claude API
- **Messaging**: Evolution API (WhatsApp)
- **Deployment**: Vercel

## 📁 Project Structure

```
ai-todo-challenge/
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── route.ts          # GET, POST /api/tasks
│   │       └── [id]/route.ts     # GET, PUT, DELETE /api/tasks/:id
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main application page
├── components/
│   ├── AddTask.tsx               # Create new tasks
│   ├── Chatbot.tsx               # AI chatbot interface
│   ├── TaskItem.tsx              # Individual task component
│   ├── TaskList.tsx              # Task list container
│   └── UserIdentification.tsx    # User login component
├── hooks/
│   ├── useTasks.ts               # Task management hook
│   └── useUser.ts                # User state management hook
├── lib/
│   ├── database.types.ts         # Supabase type definitions
│   ├── supabase.ts               # Supabase client configuration
│   └── types.ts                  # TypeScript interfaces
├── .env.local.example            # Environment variables template
├── N8N_WORKFLOW_GUIDE.md         # N8N setup instructions
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- N8N instance (cloud or self-hosted)
- OpenAI API key or Anthropic API key
- (Optional) WhatsApp Business account for WhatsApp integration

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-todo-challenge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema (see Database Setup below)
   - Copy your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_N8N_WEBHOOK_URL=your-n8n-webhook-url
   OPENAI_API_KEY=your-openai-api-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## 🗄 Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_identifier TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tasks_user ON tasks(user_identifier);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations (simplified for demo)
CREATE POLICY "Allow all operations on tasks" ON tasks
FOR ALL
USING (true)
WITH CHECK (true);
```

## 🔗 API Endpoints

### Tasks API

**Get all tasks for a user**
```http
GET /api/tasks?user_identifier=user@example.com
```

**Create a new task**
```http
POST /api/tasks
Content-Type: application/json

{
  "user_identifier": "user@example.com",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs"
}
```

**Get a specific task**
```http
GET /api/tasks/:id
```

**Update a task**
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true
}
```

**Delete a task**
```http
DELETE /api/tasks/:id
```

## 🤖 N8N Integration

See [N8N_WORKFLOW_GUIDE.md](./N8N_WORKFLOW_GUIDE.md) for detailed setup instructions.

### Quick Overview:

1. **AI Enhancement Workflow**: Enhances task titles with AI when created
2. **Chatbot Workflow**: Processes natural language commands
3. **WhatsApp Workflow**: Handles WhatsApp message interactions

## 📱 WhatsApp Integration

The WhatsApp bot allows you to manage tasks via WhatsApp messages.

### Commands:

- `#to-do list add: Buy groceries` - Add a new task
- `#to-do list show` - List all tasks
- `#to-do list complete: <task-id>` - Mark task as complete
- `#to-do list delete: <task-id>` - Delete a task

**Note**: Messages must include `#to-do list` to trigger the bot.

## 🎨 Features Showcase

### User Identification
- Simple name or email-based identification
- Stored locally in browser
- No complex authentication required

### Task Management
- Add tasks with optional descriptions
- Edit tasks inline
- Mark as complete/incomplete
- Delete unwanted tasks
- Automatic timestamps

### AI Enhancement
- Tasks are automatically enhanced with AI
- AI adds helpful context and steps
- Example: "Schedule dentist" → Enhanced with appointment preparation steps

### Chatbot
- Natural language interface
- Floating chat widget
- Real-time responses
- Beautiful message bubbles

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Update N8N webhooks**
   - Update your N8N workflows with the production URL
   - Test all integrations

## 🧪 Testing

### Manual Testing Checklist

- [ ] User can enter name/email and access app
- [ ] Tasks can be created
- [ ] Tasks can be edited
- [ ] Tasks can be marked complete/incomplete
- [ ] Tasks can be deleted
- [ ] Data persists after page refresh
- [ ] Chatbot opens and closes
- [ ] Chatbot can send messages (requires N8N setup)
- [ ] API endpoints return correct data
- [ ] WhatsApp integration works (requires setup)

### API Testing

Use curl or Postman to test API endpoints:

```bash
# Get tasks
curl "http://localhost:3000/api/tasks?user_identifier=test@example.com"

# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"user_identifier":"test@example.com","title":"Test task"}'
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | N8N chatbot webhook URL | For chatbot |
| `OPENAI_API_KEY` | OpenAI API key | For AI enhancement |
| `ANTHROPIC_API_KEY` | Anthropic API key | Alternative to OpenAI |

## 🎯 Key Decisions & Architecture

### Why Next.js App Router?
- Modern React Server Components
- Built-in API routes
- Excellent TypeScript support
- Easy Vercel deployment

### Why Supabase?
- Real-time PostgreSQL database
- Built-in authentication (expandable)
- Row Level Security
- Free tier for development

### Why N8N?
- Visual workflow builder
- Easy AI integration
- Webhook support
- Self-hostable

### Custom Hooks Pattern
- Separation of concerns
- Reusable logic
- Easier testing
- Clean components

## 🔮 Future Enhancements

- [ ] Task categories/tags
- [ ] Due dates and reminders
- [ ] Task priority levels
- [ ] Collaboration features
- [ ] Mobile app
- [ ] Voice commands
- [ ] Task analytics
- [ ] Export/import functionality

## 📄 License

This project was created for the AI Automation Developer Challenge.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Automation with [N8N](https://n8n.io/)
- AI by [OpenAI](https://openai.com/) / [Anthropic](https://anthropic.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ for the AI Automation Developer Challenge**
