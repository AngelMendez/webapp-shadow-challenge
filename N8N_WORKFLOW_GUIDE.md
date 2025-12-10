# N8N Workflow Setup Guide

## Workflow 1: AI Task Enhancement

This workflow enhances task titles with AI when tasks are created.

### Nodes Required:

#### 1. Webhook Trigger
- **Node Type:** Webhook
- **Settings:**
  - HTTP Method: POST
  - Path: `/webhook/enhance-task`
  - Response Mode: When Last Node Finishes
  - Response Code: 200

**Expected Input:**
```json
{
  "user_identifier": "user@example.com",
  "title": "Schedule dentist",
  "description": ""
}
```

#### 2. AI Enhancement (OpenAI/Claude)
- **Node Type:** OpenAI (or HTTP Request for Claude API)
- **Settings:**
  - Model: GPT-4 or GPT-3.5-turbo
  - Resource: Text
  - Operation: Message a Model

**Prompt Template:**
```
You are a helpful AI assistant that enhances task descriptions.

User's Task: "{{ $json.title }}"

Enhance this task by:
1. Making the title clearer and more specific
2. Adding helpful steps or context in the description
3. If applicable, add relevant information (e.g., for "Schedule dentist in Chicago", suggest steps and typical requirements)

Return ONLY a JSON object with this exact structure:
{
  "enhanced_title": "Clear, specific title",
  "enhanced_description": "Helpful description with steps or context"
}

Do not include any other text or formatting.
```

**Alternative for Claude API (HTTP Request):**
```json
{
  "method": "POST",
  "url": "https://api.anthropic.com/v1/messages",
  "headers": {
    "x-api-key": "{{ $env.ANTHROPIC_API_KEY }}",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  "body": {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Enhance this task: {{ $json.title }}"
      }
    ]
  }
}
```

#### 3. Parse AI Response
- **Node Type:** Code (JavaScript)
- **Purpose:** Extract enhanced title and description from AI response

**Code:**
```javascript
const webhookData = $input.first().json;
const aiResponse = $input.last().json;

// For OpenAI
let enhanced;
try {
  // Try to parse if it's JSON string
  enhanced = JSON.parse(aiResponse.choices[0].message.content);
} catch (e) {
  // If not JSON, use as-is
  enhanced = {
    enhanced_title: webhookData.title,
    enhanced_description: aiResponse.choices[0].message.content
  };
}

// For Claude (if using HTTP Request)
// const enhanced = JSON.parse(aiResponse.content[0].text);

return {
  json: {
    user_identifier: webhookData.user_identifier,
    original_title: webhookData.title,
    original_description: webhookData.description || '',
    title: enhanced.enhanced_title || webhookData.title,
    description: enhanced.enhanced_description || webhookData.description || ''
  }
};
```

#### 4. Create Task in Supabase
- **Node Type:** HTTP Request
- **Settings:**
  - Method: POST
  - URL: `{{ $env.APP_URL }}/api/tasks`
  - Body:
```json
{
  "user_identifier": "={{ $json.user_identifier }}",
  "title": "={{ $json.title }}",
  "description": "={{ $json.description }}"
}
```

**Alternative: Direct Supabase Node**
- **Node Type:** Supabase
- **Operation:** Insert
- **Table:** tasks
- **Fields:**
  - user_identifier: `{{ $json.user_identifier }}`
  - title: `{{ $json.title }}`
  - description: `{{ $json.description }}`

#### 5. Return Response
- **Node Type:** Respond to Webhook
- **Response:**
```json
{
  "success": true,
  "task": "={{ $json }}",
  "enhanced": true
}
```

---

## Workflow 2: Chatbot Interface

This workflow handles chatbot interactions for task management.

### Nodes Required:

#### 1. Webhook Trigger
- **Node Type:** Webhook
- **Settings:**
  - HTTP Method: POST
  - Path: `/webhook/chatbot`
  - Response Mode: When Last Node Finishes

**Expected Input:**
```json
{
  "user_identifier": "user@example.com",
  "message": "Add task: Buy groceries"
}
```

#### 2. Parse Intent (AI)
- **Node Type:** OpenAI / Claude
- **Purpose:** Understand user's intent

**Prompt:**
```
Parse this user message and extract their intent:
Message: "{{ $json.message }}"

Return ONLY a JSON object:
{
  "action": "add" | "list" | "complete" | "delete" | "edit",
  "task_title": "extracted task title if applicable",
  "task_id": "task id if provided",
  "new_status": "completed or incomplete if applicable"
}
```

#### 3. Switch Node
- **Node Type:** Switch
- **Routes:**
  - Route 1: action === 'add'
  - Route 2: action === 'list'
  - Route 3: action === 'complete'
  - Route 4: action === 'delete'
  - Route 5: action === 'edit'

#### 4a. Add Task Branch
- Connects to Workflow 1 (AI Enhancement)

#### 4b. List Tasks Branch
- **Node Type:** HTTP Request
- GET `{{ $env.APP_URL }}/api/tasks?user_identifier={{ $json.user_identifier }}`

#### 4c. Complete Task Branch
- **Node Type:** HTTP Request
- PUT `{{ $env.APP_URL }}/api/tasks/{{ $json.task_id }}`
- Body: `{ "completed": true }`

#### 4d. Delete Task Branch
- **Node Type:** HTTP Request
- DELETE `{{ $env.APP_URL }}/api/tasks/{{ $json.task_id }}`

#### 5. Format Response
- **Node Type:** Code (JavaScript)

**Code:**
```javascript
const intent = $input.first().json;
const result = $input.last().json;

let message = '';

switch (intent.action) {
  case 'add':
    message = `✅ Task created: "${result.task.title}"`;
    if (result.enhanced) {
      message += `\n📝 AI enhanced your task with helpful details!`;
    }
    break;
  case 'list':
    const tasks = result.tasks || [];
    if (tasks.length === 0) {
      message = 'You have no tasks yet!';
    } else {
      message = `You have ${tasks.length} task(s):\n\n`;
      tasks.forEach((task, i) => {
        message += `${i + 1}. ${task.completed ? '✅' : '⏳'} ${task.title}\n`;
      });
    }
    break;
  case 'complete':
    message = `✅ Task marked as complete!`;
    break;
  case 'delete':
    message = `🗑️ Task deleted successfully!`;
    break;
  default:
    message = `Action completed!`;
}

return {
  json: {
    message,
    data: result
  }
};
```

#### 6. Return Response
- **Node Type:** Respond to Webhook

---

## Environment Variables in N8N

Set these in your N8N instance:

```
APP_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-key
# OR
ANTHROPIC_API_KEY=your-anthropic-key

SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

---

## Testing Your Workflows

### Test AI Enhancement:
```bash
curl -X POST https://your-n8n-instance.com/webhook/enhance-task \
  -H "Content-Type: application/json" \
  -d '{
    "user_identifier": "test@example.com",
    "title": "Schedule dentist in Chicago",
    "description": ""
  }'
```

### Test Chatbot:
```bash
curl -X POST https://your-n8n-instance.com/webhook/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "user_identifier": "test@example.com",
    "message": "Add task: Buy groceries for the week"
  }'
```

---

## Next Steps

After creating these workflows:
1. Copy the webhook URLs from N8N
2. Add them to your `.env.local` file
3. Update the chatbot component to use the N8N webhook
4. Test the integration!
