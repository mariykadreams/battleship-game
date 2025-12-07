# 🚢 Battleship Game

A **web-based implementation** of the classic Battleship game built with a focus on _clean architecture_ and **strategic gameplay**. This full-stack application features a RESTful API backend and a modern React frontend.

## 📋 About The Project

This is a **turn-based strategy game** where two players compete to sink each other's fleet. Players place their ships on a **10×10 grid** and take turns attacking coordinates on their opponent's board. The first player to sink all enemy ships **wins**!

### Features

- ✅ **Interactive Ship Placement** - Drag-and-drop style placement
- ✅ **Turn-Based Gameplay** - Strategic attacks with hit/miss feedback
- ✅ **Visual Feedback** - Clear indicators for hits, misses, and ship locations
- ✅ **Game State Management** - Real-time synchronization between players
- ✅ **Responsive Design** - Works on different screen sizes

## 🛠️ Tech Stack

### Backend
- **.NET 8.0** - Modern C# framework
- **ASP.NET Core Web API** - RESTful API
- **C#** - Strongly typed language
- **In-Memory Storage** - Fast game state management (MVP)

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **SweetAlert2** - User notifications

## 🚀 Getting Started

### Prerequisites

- **.NET 8.0 SDK** 
- **Node.js** (v18 or higher) 
- **npm** or **yarn** - Comes with Node.js

### Installation & Running

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/Battleship.API
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

   The API will start on `https://localhost:7122` (or `http://localhost:5212`)

4. **Important:** If using HTTPS, you may need to accept the self-signed certificate in your browser when accessing Swagger UI at `https://localhost:7122/swagger`

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

4. Open your browser and navigate to the URL shown in the terminal

## ⚠️ Troubleshooting

### SSL/HTTPS Connection Error

**Error:** `ERR_SSL_PROTOCOL_ERROR` or `net::ERR_SSL_PROTOCOL_ERROR` when trying to connect to the backend API.

**Cause:** The frontend is configured to use HTTPS (`https://localhost:5212`), but the backend is running on HTTP (`http://localhost:5212`).

**Solution:**

1. Open `frontend/src/services/api.ts`
2. Find line 13 with:
   ```typescript
   const API_BASE_URL = 'https://localhost:5212/api/games';
   ```
3. Change it to use HTTP instead:
   ```typescript
   const API_BASE_URL = 'http://localhost:5212/api/games';
   ```
4. Save the file and restart your Vite dev server (or wait for hot-reload)

### Running Tests

#### Backend Tests

```bash
cd backend/Battleship.Test
dotnet test
```

## 🎮 How to Play

1. **Enter Player Names** - Both players enter their names
2. **Place Ships** - Each player places their fleet:
   - Ships sizes: 5, 4, 3, 3, and 2
   - Ships cannot overlap or touch each other (including diagonally)
   - Select orientation (horizontal/vertical) before placing
3. **Start Game** - Game begins automatically when both players place their ships
4. **Attack** - Players take turns clicking cells on the opponent's board
5. **Win** - First player to sink all opponent's ships wins!

## 📁 Project Structure

```
battleship-game/
├── backend/
│   ├── Battleship.API/          # Main API project
│   │   ├── Controllers/         # API endpoints
│   │   ├── Models/              # Domain models
│   │   ├── Services/            # Business logic
│   │   └── Contracts/          # DTOs and mappings
│   └── Battleship.Test/         # Integration tests
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API service
│   │   ├── types/               # TypeScript types
│   │   └── hooks/               # Custom React hooks
│   └── public/                  # Static assets
```

## 📖 Documentation

- **[Architecture Documentation](https://github.com/mariykadreams/battleship-game/wiki/Battleship-Game-Architecture-Documentation)** - Detailed technical architecture, component structure, and design decisions
- **[Development Log](https://github.com/mariykadreams/battleship-game/wiki/Day‐by‐Day-Development-Log)** - Day-by-day development journey, challenges encountered, and lessons learned

## 🔧 API Endpoints

- `POST /api/games` - Create a new game
- `GET /api/games/{id}` - Get game state
- `GET /api/games/{id}/players/{playerId}` - Get player's view
- `POST /api/games/{id}/ships` - Place ships for a player
- `POST /api/games/{id}/start` - Start the game
- `POST /api/games/{id}/attacks` - Make an attack

## 🚧 Future Plans

- [ ] Add AI opponent for single-player mode
- [ ] User authentication and authorization
- [ ] Game history and replay functionality



Built as a learning project to explore full-stack development with .NET and React.

---

**Enjoy playing Battleship!** 🎯
