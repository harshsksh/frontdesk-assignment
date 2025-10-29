# Troubleshooting Guide

## Quick Checks

### 1. Backend Status
```powershell
curl http://localhost:3001/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 2. Frontend Status
- Open: http://localhost:3000
- Check browser console (F12) for errors

### 3. Check if services are running
```powershell
# Check backend
netstat -ano | findstr :3001

# Check frontend  
netstat -ano | findstr :3000
```

## Common Issues

### Issue: "Cannot find module '@shared/types'"
**Solution:** Make sure Vite dev server is restarted after config changes
```powershell
# Stop the dev server (Ctrl+C) and restart:
npm run dev:ui
```

### Issue: "EADDRINUSE: address already in use"
**Solution:** Kill the process using the port
```powershell
# Find process
netstat -ano | findstr :3001

# Kill it (replace PID with actual process ID)
taskkill /F /PID <PID>
```

### Issue: Frontend shows blank page
**Check:**
1. Browser console (F12) for errors
2. Network tab to see if API calls are failing
3. Make sure backend is running on port 3001

### Issue: API calls fail with CORS error
**Solution:** Backend has CORS enabled, but check:
1. Backend is running
2. Proxy is configured in vite.config.ts

## Manual Testing

### Test Backend API:
```powershell
# Health check
curl http://localhost:3001/api/health

# Simulate a call (known question)
curl -X POST http://localhost:3001/api/calls/simulate -H "Content-Type: application/json" -d '{\"phone\": \"+1234567890\", \"name\": \"Test\", \"question\": \"What are your hours?\"}'

# Simulate a call (unknown question - creates request)
curl -X POST http://localhost:3001/api/calls/simulate -H "Content-Type: application/json" -d '{\"phone\": \"+1234567891\", \"name\": \"Test2\", \"question\": \"Do you have parking?\"}'

# Check pending requests
curl http://localhost:3001/api/requests/pending

# Check knowledge base
curl http://localhost:3001/api/knowledge
```

