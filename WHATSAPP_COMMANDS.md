# WhatsApp Bot Commands - Quick Reference

## How to Use

All commands must start with `#to-do list` to trigger the bot.

---

## Available Commands

### 📝 Add a Task
```
#to-do list add: Task description here
```
**Example:**
```
#to-do list add: Buy groceries for the week
```

---

### 📋 List All Tasks
```
#to-do list show
```
or
```
#to-do list list
```

**Response Example:**
```
📝 Your Tasks (3)

1. ⏳ Buy groceries
   ID: a1b2c3d4

2. ✅ Call dentist
   ID: e5f6g7h8

3. ⏳ Finish project
   ID: i9j0k1l2
```

---

### ✅ Complete a Task
```
#to-do list complete: [task-id]
```
**Example:**
```
#to-do list complete: a1b2c3d4
```

---

### 🗑️ Delete a Task
```
#to-do list delete: [task-id]
```
**Example:**
```
#to-do list delete: e5f6g7h8
```

---

### ❓ Get Help
```
#to-do list help
```

---

## Tips

1. **Task IDs:** Get task IDs by using `#to-do list show` command
2. **Shortcuts:** Use just the first 8 characters of the task ID
3. **Case Insensitive:** Commands work in any case
4. **Spaces:** Extra spaces are OK, the bot will clean them up

---

## Examples

### Quick Workflow

1. **Add tasks:**
   ```
   #to-do list add: Morning workout
   #to-do list add: Read 30 pages
   #to-do list add: Call mom
   ```

2. **Check your list:**
   ```
   #to-do list show
   ```

3. **Mark one complete:**
   ```
   #to-do list complete: abc12345
   ```

4. **Delete unnecessary task:**
   ```
   #to-do list delete: def67890
   ```

---

## Notes

- Each message should contain only ONE command
- The bot responds to each command individually
- Your tasks are linked to your WhatsApp number
- Tasks sync with the web app in real-time

---

## Need Help?

If the bot doesn't respond:
1. Make sure you included `#to-do list` at the start
2. Check that your command format is correct
3. Try sending `#to-do list help`

---

**Enjoy managing your tasks via WhatsApp! 📱✨**
