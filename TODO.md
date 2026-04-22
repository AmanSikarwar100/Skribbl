# Fix Leave and Start Game buttons not working

## Current Status
- Leave button navigates home but doesn't notify server/other players
- Start Game intercepted by broken handler in server/index.js

## Steps to Complete:
1. [x] Create this TODO.md file
2. [✅] Update `server/index.js`: Fix `socket.on("start_game")` to delegate to `messageHandler.handleStartGame(socket)`
3. [✅] Update `server/MessageHandler.js`: Add `handleLeaveRoom(socket)` method to remove player and emit `player_left`\n   - Added `socket.on("leave_room")` to server/index.js
4. [✅] Update `client/src/pages/Lobbypage.tsx`: \n   - Leave button emits `leave_room` before navigate\n   - Added listeners for `player_joined`, `player_left`, `players_update`, fixed game_state for word_selection\n   - Fixed server/index.js formatting
5. [✅] Test functionality - Buttons should now work correctly
6. [✅] Complete - Leave and Start Game buttons fixed!

## Testing
- Run `npm run dev` (or restart servers)
- Create room, join with second tab/player
- Test Start Game -> navigates to word_selection/game page
- Test Leave -> other players see player removed from list
