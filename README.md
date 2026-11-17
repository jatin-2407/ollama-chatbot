# Ollama Chat

A web chat app for the models running on your own machine through [Ollama](https://ollama.com). Pick one model, or two to see their answers next to each other, and keep a separate history for each chat.

- Sign up and sign in; each user only sees their own chats
- Create chats with one or two local models
- Markdown replies with code blocks and tables, plus a copy button
- Light and dark theme
- Built with [Bun](https://bun.com), React, Tailwind CSS, Hono and MongoDB

---

## Requirements

| Tool | Notes |
| --- | --- |
| [Bun](https://bun.com/docs/installation) 1.3+ | Runtime, package manager, bundler and test runner |
| [MongoDB](https://www.mongodb.com/docs/manual/installation/) | Local install or a hosted cluster such as Atlas |
| [Ollama](https://ollama.com/download) | Runs the models; must be running on the same machine |

---

## 1. Set up Ollama

Follow the official docs. They are the source of truth and change more often than this README:

- **Install:** <https://ollama.com/download>
- **Quickstart:** <https://docs.ollama.com/quickstart>
- **Full documentation:** <https://docs.ollama.com>
- **Model library** (names you can pull): <https://ollama.com/library>
- **GitHub repo:** <https://github.com/ollama/ollama>
- **JavaScript client** (used by this app): <https://github.com/ollama/ollama-js>

Quick version:

```bash
# Linux / macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows (PowerShell)
irm https://ollama.com/install.ps1 | iex
```

On macOS and Windows you can also download the desktop app from the [download page](https://ollama.com/download) and open it.

Make sure the Ollama server is running. The desktop app starts it for you; on Linux you can start it yourself:

```bash
ollama serve
```

Then download at least one model. Any model from the [library](https://ollama.com/library) works, for example:

```bash
ollama pull llama3.1
ollama pull qwen2.5-coder

ollama list   # these names are what the app shows in "New chat"
```

The app talks to Ollama at its default address, `http://127.0.0.1:11434`.

---

## 2. Install and configure the app

```bash
git clone https://github.com/jatin-2407/ollama-chatbot.git
cd ollama-chatbot
bun install
cp .env_example .env
```

Edit `.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URI` | yes | MongoDB connection string |
| `APP_PASSWORD_CODE` | yes | Secret used to sign login tokens. Use a long random string, e.g. `openssl rand -hex 32` |
| `TEST_DATABASE_URI` | for tests | Separate database used by `bun test` |
| `APP_BCRYPT_SALT_ROUNDS` | no | Password hashing cost (default `10`) |
| `PORT` / `HOST` | no | Server address (default `3000` / `0.0.0.0`) |
| `CHAT_DATA_DIR` | no | Folder for chat history files (default `./data/chats`) |

Bun loads `.env` automatically. If a required variable is missing, the server refuses to start and names the variable.

---

## 3. Run

```bash
bun dev      # development, with hot reload
bun start    # production mode
```

Open <http://localhost:3000>.

---

## Using the app

1. **Create an account** on the sign-up page, then sign in.
2. Click **New chat**, give it a title and choose **one or two models** from the ones installed in Ollama.
3. Type in **Enter your message** and press **Enter** to send (**Shift + Enter** adds a new line). With two models selected, each answers in its own panel.
4. Your chats are listed in the sidebar. Use the search box to filter them, and the trash icon to delete one (you'll be asked to confirm).
5. Switch between light and dark theme with the sun/moon button next to your name.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Couldn't reach Ollama. Make sure it is running." | Start Ollama (open the app, or run `ollama serve`) and check `ollama list` works. |
| "No models installed" in the New chat dialog | Pull a model: `ollama pull llama3.1`. |
| A model fails to respond | Check it runs on its own: `ollama run <model>`. Large models need enough RAM/VRAM. |
| Server exits with "Missing required environment variable" | Add that variable to `.env`. |
| Server exits with a MongoDB connection error | Check MongoDB is running and `DATABASE_URI` is correct. |
| "Your session has expired" | Sign in again. Tokens last 7 days. |

---

## Project structure

```
src/
├── index.ts            # server entry: Bun.serve + API routes + the web app
├── config.ts           # environment variables, checked at startup
├── shared/             # used by both frontend and backend
│   ├── schemas.ts      #   validation rules (Zod) and limits
│   └── types.ts        #   API types and route paths
├── controllers/        # API route handlers (auth, chats, messages)
├── middlewares/        # auth + request validation
├── services/           # database and Ollama logic, chat history files
├── database/           # MongoDB connection and models
├── utils/              # HTTP helpers and router
├── components/         # React UI (pages, chat, ui kit)
├── hooks/              # useAuth, useAsync, useForm, useTheme
├── lib/                # API client and helpers
└── tests/              # bun test suites
styles/globals.css      # theme colours (light + dark)
data/chats/             # chat history, one JSON file per chat per model (git-ignored)
```

Chat titles and model choices are stored in MongoDB. The messages themselves are stored as JSON files in `data/chats/`. Deleting a chat removes both.

---

## Tests

```bash
bun test
```

The tests start the server and use `TEST_DATABASE_URI`. They clean up the users and chats they create. If port 3000 is already in use (for example by `bun dev`), run them on another port:

```bash
PORT=3999 bun test
```

---

## API

All routes are under `/api/v1`. Every route except sign-up and sign-in needs the login token in an `auth-token` header. Errors always look like `{ "message": "...", "errors": { "field": "..." } }`.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/signup` | Create an account `{ name, email, password }` |
| POST | `/signIn` | Sign in `{ email, password }` → `{ token, user }` |
| GET | `/chat/models` | Models installed in Ollama |
| GET | `/chat/list` | Your chats |
| POST | `/chat/create` | Create a chat `{ title, model_names }` |
| GET | `/chat/:id` | Messages for each model in a chat |
| DELETE | `/chat/:id` | Delete a chat and its history |
| POST | `/message/send` | Send `{ chatId, message }` → one reply per model |
