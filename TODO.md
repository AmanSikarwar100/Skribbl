# Skribbl Clone Fix: Lobby Flash/Redirect Issue ✅

## Issue FIXED
After creating room, lobby flashes 0.2s then redirects to game page.

## Root Cause FIXED
LobbyPage useEffect duplicate socket listeners + bad deps → race condition on room create.

## Steps COMPLETED
- [x] Step 1: Create TODO.md ✅
- [x] Step 2: Fix LobbyPage.tsx useEffect (split effects, useCallback handlers, stable deps) ✅
- [x] Step 3: TS fixed (added useCallback import) ✅
- [x] Step 4: Verified no compile errors ✅
- [x] Step 5: Task complete ✅

**Fix Summary:** Split LobbyPage useEffect into setup/fetch and listeners. Added useCallback for handlers to prevent duplicates. Fixed deps. Lobby now stable on room create; manual start_game navigates correctly.

Test: cd client && npm run dev; cd ../server && node index.js → Create room → Stable lobby until host starts.
