# claude-skill-x-twitter

A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill that gives your AI agent full access to the X (Twitter) API v2. Post tweets, search, engage, moderate, and analyze — 31 commands, plain JavaScript, no build step.

## What it does

This skill lets Claude interact with X/Twitter on your behalf using your own developer credentials (OAuth 1.0a, pay-per-use). Every command runs through a single entry point and returns structured JSON.

**31 commands** across 7 categories:

| Category | Commands |
|---|---|
| **Core** | `me`, `search`, `get`, `post`, `delete` |
| **Engagement** | `like`, `unlike`, `repost`, `unrepost` |
| **Social** | `user`, `follow`, `unfollow`, `followers`, `following` |
| **Feed** | `timeline`, `mentions` |
| **Bookmarks** | `bookmark`, `unbookmark`, `bookmarks` |
| **Moderation** | `mute`, `unmute`, `muted`, `blocked`, `hide-reply` |
| **Analytics** | `likers`, `reposters`, `quotes`, `count`, `reposts-of-me` |
| **Discovery** | `search-users`, `trending` |

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- Node.js 18+
- X Developer account with OAuth 1.0a credentials ([developer portal](https://developer.x.com/))

## Installation

Clone into your Claude Code skills directory:

```bash
git clone https://github.com/michaelcarwile/claude-skill-x-twitter.git ~/.claude/skills/claude-skill-x-twitter
npm install --prefix ~/.claude/skills/claude-skill-x-twitter
```

Create a `.env.local` file in the skill directory with your credentials:

```
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret
```

Optionally add a Bearer Token for full-archive search:

```
X_API_BEARER_TOKEN=your_bearer_token
```

## Usage

Once installed, Claude Code automatically detects the skill via `SKILL.md`. Ask Claude to interact with X/Twitter and it will use the appropriate command.

Commands run as:

```bash
node ~/.claude/skills/claude-skill-x-twitter/x.js <command> [flags]
```

### Examples

```bash
# Your profile
node x.js me

# Search recent tweets
node x.js search "claude code"

# Post a tweet
node x.js post "Hello from Claude Code"

# Look up a user
node x.js user elonmusk

# Reply to a tweet
node x.js post "Great thread!" --reply-to 1234567890

# Get trending topics
node x.js trending

# Your home timeline (excluding replies and retweets)
node x.js timeline --exclude replies,retweets

# Paginate results
node x.js search "AI" --max-results 50 --next-token abc123
```

### Flags

Most commands support:

- `--raw` — return the full API response (includes metadata, pagination tokens)
- `--max-results <n>` — limit result count (minimum varies by endpoint)
- `--next-token <token>` — continue paginated results
- `--start-time <ISO>` / `--end-time <ISO>` — filter by time range

See the `docs/` directory for per-command reference.

## Credential resolution

Credentials are loaded from the first source that provides them:

1. `.env.local` in your current working directory
2. `.env` in your current working directory
3. `.env.local` in the skill directory
4. `.env` in the skill directory
5. Environment variables

## License

[MIT](LICENSE)
