# Skribbl Clone Fix & Complete Plan
Project has lobby working, stubs for game, but game logic incomplete. Dependencies installed. Windows cmd issues prevented re-install but node_modules exist.

## Issues Identified
1. **Server Game Logic**: server/index.js has basic start_game but no full game flow (word select, drawing sync, guessing, rounds, scoring). Game.js class exists but not integrated.
2. **Client Stub Components**: DrawingCanvas/ChatPanel ready but need socket events. WordSelection/RoundEnd/GameOver likely empty stubs.
3. **Socket Events Missing**: Client GamePage listens for 'draw_data', 'chat_message', etc. Server doesn't emit them.
4. **App.tsx Bug**: Missing myAvatar in context value.
5. **Console.logs**: Minor in GamePage/Lobby/Home.
6. **Lobby UI**: Basic HTML, no settings display/kick.
7. **No Run Servers**: Need to start server/client.

## Fix Steps (in order)
### 1. Fix App.tsx (quick)
- Add myAvatar to context value.

### 2. Integrate Server Game Logic
- Edit server/index.js to use Game.js/Room.js.
- Add events: start_round, word_selected, draw_data sync, send_message (guess check), round_end, etc.

### 3. Client Components
- Read/fix WordSelection.tsx, RoundEnd.tsx, GameOver.tsx if broken.
- Ensure Canvas/Chat sync with new events.

### 4. Test Flow
- Start server/client.
- Create room, start, word select, draw/guess.

## Commands to Run
```
# Terminal 1 (server)
cd server
npm start

# Terminal 2 (client)
cd client
npm run dev
```

Proceeding with fixes step-by-step. Progress marked here.
- [x] 1. App.tsx (fixed context value)
- [x] 2. Server integration (index.js + MessageHandler.js + Rooms.js)

- [ ] 3. Client components
- [ ] 4. Test & polish


