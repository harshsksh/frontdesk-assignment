# Step-by-Step Test Instructions

## 1. Start Backend Server
In **Terminal 1**:
```powershell
npm run dev
```
**Expected output:**
```
📁 Database initialized (file-based storage)
⏰ Timeout handler started
🚀 Server running on http://localhost:3001
```

## 2. Start Frontend Server
In **Terminal 2**:
```powershell
npm run dev:ui
```
**Expected output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

## 3. Test Backend (in Terminal 3)
```powershell
# Health check
curl http://localhost:3001/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

## 4. Test Frontend
1. Open browser: http://localhost:3000
2. **Expected:** Supervisor Panel with tabs (Pending Requests, History, Knowledge Base)
3. **If blank/error:** Press F12, check Console tab for errors

## 5. Create Test Request
In Terminal 3:
```powershell
curl -X POST http://localhost:3001/api/calls/simulate -H "Content-Type: application/json" -d "{\"phone\": \"+1234567890\", \"name\": \"Test User\", \"question\": \"Do you have free parking?\"}"
```

## 6. Check UI
- Open http://localhost:3000
- Click "Pending Requests" tab
- **Expected:** The test request should appear

## Common Error Messages & Fixes

### "Cannot GET /"
- Backend not running → Start with `npm run dev`

### "Failed to fetch" or CORS error
- Backend not running or wrong port → Check port 3001

### Blank white page
- Check browser console (F12) → Look for import/module errors
- Restart Vite: Stop (Ctrl+C) and run `npm run dev:ui` again

### "Cannot find module '@shared/types'"
- Vite config issue → Restart dev server after config changes

