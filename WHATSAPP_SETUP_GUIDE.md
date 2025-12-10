# WhatsApp Integration Setup Guide

This guide will help you set up WhatsApp integration for your AI To-Do List application using Evolution API.

## Overview

The WhatsApp bot will allow users to manage their tasks via WhatsApp messages using the `#to-do list` hashtag as a filter.

## Option 1: Evolution API (Recommended)

Evolution API is a popular open-source WhatsApp API solution.

### Step 1: Set Up Evolution API

You have several options:

#### Option A: Cloud Service (Easiest)
Use a hosted Evolution API service like:
- [Evolution API Cloud](https://evolution-api.com/) (Paid)
- Deploy on Railway/Render (Free tier available)

#### Option B: Self-Host with Docker (Free)

```bash
# Clone Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Create .env file
cp .env.example .env

# Edit .env with your settings
# Start with Docker Compose
docker-compose up -d
```

#### Option C: Deploy to Railway (Free/Easy)

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Use this template: `https://github.com/EvolutionAPI/evolution-api`
4. Wait for deployment
5. Get your API URL from Railway

### Step 2: Create WhatsApp Instance

Once Evolution API is running, create a WhatsApp instance:

**Using API:**
```bash
curl -X POST 'YOUR_EVOLUTION_API_URL/instance/create' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_API_KEY' \
  -d '{
    "instanceName": "todo-bot",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

**Response:**
```json
{
  "instance": {
    "instanceName": "todo-bot",
    "status": "created"
  },
  "qrcode": {
    "code": "base64-qr-code-here",
    "base64": "data:image/png;base64,..."
  }
}
```

### Step 3: Connect Your WhatsApp Number

1. **Get QR Code:**
   ```bash
   curl -X GET 'YOUR_EVOLUTION_API_URL/instance/connect/todo-bot' \
     -H 'apikey: YOUR_API_KEY'
   ```

2. **Scan QR Code:**
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code from the API response

3. **Verify Connection:**
   ```bash
   curl -X GET 'YOUR_EVOLUTION_API_URL/instance/connectionState/todo-bot' \
     -H 'apikey: YOUR_API_KEY'
   ```

### Step 4: Set Up Webhook

Configure Evolution API to send messages to your N8N workflow:

```bash
curl -X POST 'YOUR_EVOLUTION_API_URL/webhook/set/todo-bot' \
  -H 'Content-Type: application/json' \
  -H 'apikey: YOUR_API_KEY' \
  -d '{
    "url": "YOUR_N8N_WEBHOOK_URL/webhook/whatsapp",
    "webhook_by_events": true,
    "events": [
      "MESSAGES_UPSERT"
    ]
  }'
```

---

## Option 2: Alternative WhatsApp APIs

### Twilio WhatsApp API (Paid but Reliable)

1. Sign up at [Twilio](https://www.twilio.com/whatsapp)
2. Get WhatsApp-enabled number
3. Configure webhook to N8N
4. More stable but requires approval for production

### Baileys (Open Source, Self-Hosted)

Direct implementation using Baileys library - more technical but free.

---

## N8N WhatsApp Workflow

Now let's create the N8N workflow to handle WhatsApp messages.

### Workflow Structure:

```
1. Webhook Trigger (from Evolution API)
   ↓
2. Filter Node (check for #to-do list)
   ↓
3. Parse Intent Node (AI or regex)
   ↓
4. Switch Node (based on command)
   ↓
5. Execute Action (add/list/complete/delete)
   ↓
6. Send WhatsApp Response
```

### Node Details:

#### 1. Webhook Trigger
- **Type:** Webhook
- **Path:** `/webhook/whatsapp`
- **Method:** POST
- **Response Mode:** Immediately

**Expected Payload from Evolution API:**
```json
{
  "event": "messages.upsert",
  "instance": "todo-bot",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "message-id"
    },
    "message": {
      "conversation": "#to-do list add: Buy groceries"
    },
    "messageTimestamp": "1234567890",
    "pushName": "User Name"
  }
}
```

#### 2. Filter Messages
- **Type:** IF Node
- **Condition:** `{{ $json.data.message.conversation }}` contains `#to-do list`
- **Only continue if:** TRUE

#### 3. Extract User & Message
- **Type:** Code (JavaScript)

```javascript
const data = $json.data;
const phoneNumber = data.key.remoteJid.split('@')[0];
const message = data.message.conversation || data.message.extendedTextMessage?.text || '';
const userName = data.pushName;

// Remove the hashtag trigger
const cleanMessage = message.replace('#to-do list', '').trim();

return {
  json: {
    user_identifier: phoneNumber,
    phone_number: phoneNumber,
    user_name: userName,
    message: cleanMessage,
    original_message: message,
    instance: $json.instance
  }
};
```

#### 4. Parse Intent with AI
- **Type:** OpenAI / HTTP Request
- **Prompt:**

```
Parse this WhatsApp message and extract the intent:
Message: "{{ $json.message }}"

Return ONLY JSON:
{
  "action": "add" | "list" | "show" | "complete" | "delete" | "help",
  "task_title": "title if adding task",
  "task_id": "id if updating/deleting",
  "query": "any additional context"
}
```

#### 5. Switch Based on Action
- **Type:** Switch
- **Routes:**
  - Route 1: `{{ $json.action }}` equals `add`
  - Route 2: `{{ $json.action }}` equals `list` or `show`
  - Route 3: `{{ $json.action }}` equals `complete`
  - Route 4: `{{ $json.action }}` equals `delete`
  - Route 5: `{{ $json.action }}` equals `help`

#### 6a. Add Task Route
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `{{ $env.APP_URL }}/api/tasks`
- **Body:**
```json
{
  "user_identifier": "={{ $json.user_identifier }}",
  "title": "={{ $json.task_title }}",
  "description": "Created via WhatsApp"
}
```

#### 6b. List Tasks Route
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `{{ $env.APP_URL }}/api/tasks?user_identifier={{ $json.user_identifier }}`

#### 6c. Complete Task Route
- **Type:** HTTP Request
- **Method:** PUT
- **URL:** `{{ $env.APP_URL }}/api/tasks/{{ $json.task_id }}`
- **Body:**
```json
{
  "completed": true
}
```

#### 6d. Delete Task Route
- **Type:** HTTP Request
- **Method:** DELETE
- **URL:** `{{ $env.APP_URL }}/api/tasks/{{ $json.task_id }}`

#### 7. Format WhatsApp Response
- **Type:** Code (JavaScript)

```javascript
const action = $input.first().json.action;
const result = $input.last().json;
const phoneNumber = $input.first().json.phone_number;

let message = '';

switch (action) {
  case 'add':
    message = `✅ Task Created!\n\n*${result.task.title}*\n${result.task.description || ''}`;
    break;

  case 'list':
  case 'show':
    const tasks = result.tasks || [];
    if (tasks.length === 0) {
      message = '📝 You have no tasks!';
    } else {
      message = `📝 *Your Tasks* (${tasks.length})\n\n`;
      tasks.forEach((task, i) => {
        const status = task.completed ? '✅' : '⏳';
        message += `${i + 1}. ${status} ${task.title}\n`;
        message += `   ID: ${task.id.substring(0, 8)}\n\n`;
      });
    }
    break;

  case 'complete':
    message = '✅ Task marked as complete!';
    break;

  case 'delete':
    message = '🗑️ Task deleted successfully!';
    break;

  case 'help':
    message = `📱 *WhatsApp To-Do Bot*\n\n` +
              `Commands:\n` +
              `• #to-do list add: [task] - Add new task\n` +
              `• #to-do list show - List all tasks\n` +
              `• #to-do list complete: [id] - Mark complete\n` +
              `• #to-do list delete: [id] - Delete task\n` +
              `• #to-do list help - Show this help`;
    break;

  default:
    message = '❓ Unknown command. Send "#to-do list help" for commands.';
}

return {
  json: {
    phone_number: phoneNumber,
    message: message
  }
};
```

#### 8. Send WhatsApp Reply
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `{{ $env.EVOLUTION_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}`
- **Headers:**
  - `apikey`: `{{ $env.EVOLUTION_API_KEY }}`
  - `Content-Type`: `application/json`
- **Body:**
```json
{
  "number": "={{ $json.phone_number }}",
  "text": "={{ $json.message }}"
}
```

---

## Environment Variables

Add these to your N8N environment:

```env
EVOLUTION_API_URL=https://your-evolution-api.com
EVOLUTION_API_KEY=your-api-key
WHATSAPP_INSTANCE=todo-bot
APP_URL=https://your-vercel-app.com
```

---

## Testing Your WhatsApp Bot

### Basic Test Flow:

1. **Send Help Command:**
   ```
   #to-do list help
   ```
   Expected: Help message with all commands

2. **Add a Task:**
   ```
   #to-do list add: Buy groceries for the week
   ```
   Expected: Confirmation with task details

3. **List Tasks:**
   ```
   #to-do list show
   ```
   Expected: List of all your tasks with IDs

4. **Complete a Task:**
   ```
   #to-do list complete: abc12345
   ```
   Expected: Confirmation of completion

5. **Delete a Task:**
   ```
   #to-do list delete: abc12345
   ```
   Expected: Deletion confirmation

---

## Troubleshooting

### QR Code Won't Generate
- Check Evolution API is running
- Verify API key is correct
- Try recreating the instance

### Messages Not Received
- Check webhook is configured correctly
- Verify N8N webhook URL is accessible
- Check Evolution API logs

### Bot Not Responding
- Verify filter is working (`#to-do list` present)
- Check N8N workflow execution logs
- Test API endpoints directly

### Connection Lost
- QR code expires after 40 seconds
- Need to rescan if disconnected
- Check phone is connected to internet

---

## Production Tips

1. **Use a Dedicated Number:** Don't use your personal WhatsApp
2. **Set Up Monitoring:** Track message deliveries and failures
3. **Rate Limiting:** Prevent spam/abuse
4. **Error Handling:** Graceful fallbacks for API failures
5. **Backup:** Export your Evolution API configuration

---

## Security Considerations

- Never expose your Evolution API key
- Use environment variables for all secrets
- Implement user verification if needed
- Monitor for unusual activity
- Set up API rate limits

---

## Alternative: Testing Without Evolution API

If you want to test the workflow logic without WhatsApp:

1. Use N8N's manual trigger
2. Send test JSON payloads
3. Verify workflow logic works
4. Then connect WhatsApp later

**Test Payload:**
```json
{
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net"
    },
    "message": {
      "conversation": "#to-do list add: Test task"
    },
    "pushName": "Test User"
  }
}
```

---

## Next Steps

1. Choose your Evolution API deployment method
2. Set up the instance and connect your number
3. Build the N8N workflow following the structure above
4. Test with basic commands
5. Add error handling and polish
6. Document your WhatsApp number for the challenge submission

Good luck with your WhatsApp integration!
