---
name: claude-skill-x-twitter
description: Interact with X (Twitter) API v2. Post tweets, search, engage, moderate, and analyze — all from your AI agent. Full 31-command skill for Twitter/X automation.
license: MIT
metadata:
  author: michaelcarwile
  version: "1.0.0"
  tags: x, twitter, x-twitter, twitter-api, social-media, tweets, automation
allowed-tools: Bash(node *), Bash(npm *), Bash(npx *), Bash(ls *)
---

X (Twitter) API v2 skill using the authenticated user's own developer credentials (OAuth 1.0a, pay-per-use). All commands go through a single entry point: `node <base_directory>/x.js <command> [flags]`. Each command has its own doc file with the full reference for flags and behavior.

[!SETUP] Before first use, check whether `<base_directory>/node_modules` exists. If it does NOT exist, run `npm install --prefix <base_directory>`. No build step is required — this skill uses plain JavaScript (ESM). NEVER cd into the skill directory; use --prefix to target it without changing your working directory.

[!COMMANDS]

Core:
a) `me` — authenticated user's own account data (profile, metrics, verification). @docs/me.md.
b) `search` — search posts by a SINGLE query (last 7 days or full archive). Only use for single-term or single-operator queries (e.g. `from:username`, one keyword). For 2+ search terms, ALWAYS use `batch-search` instead. @docs/search.md.
b2) `batch-search` — THE DEFAULT SEARCH COMMAND. Use this whenever searching for multiple terms (which is the common case). Combines terms into optimized OR queries, auto-splits at the 512-char limit, deduplicates results. @docs/batch-search.md.
c) `get` — retrieve one or more posts by ID. @docs/get.md.
d) `post` — create a tweet, reply, or quote tweet. @docs/post.md.
e) `delete` — delete a post owned by the authenticated user. @docs/delete.md.

Engagement:
f) `like` — like a post by tweet ID. @docs/like.md.
g) `unlike` — remove a like from a post. @docs/like.md.
h) `repost` — repost (retweet) a post. @docs/repost.md.
i) `unrepost` — remove a repost. @docs/repost.md.

Social:
j) `user` — look up user(s) by username or ID. @docs/user.md.
k) `follow` — follow a user by username or ID. @docs/follow.md.
l) `unfollow` — unfollow a user. @docs/follow.md.
m) `followers` — list a user's followers. @docs/followers.md.
n) `following` — list accounts a user follows. @docs/followers.md.

Feed:
o) `timeline` — your home timeline (reverse chronological, not the algorithmic "For you" feed). Note (2026-02-14): the X API returns heavily skewed results — mostly own tweets — and does not faithfully reproduce the "Following" tab on x.com. Use `--exclude replies,retweets` to improve signal. @docs/timeline.md.
p) `mentions` — posts that mention you. @docs/mentions.md.

Bookmarks:
q) `bookmark` — bookmark a post. @docs/bookmark.md.
r) `unbookmark` — remove a bookmark. @docs/bookmark.md.
s) `bookmarks` — list your bookmarks. @docs/bookmark.md.

Moderation:
t) `mute` — mute a user. @docs/mute.md.
u) `unmute` — unmute a user. @docs/mute.md.
v) `muted` — list muted accounts. @docs/mute.md.
w) `blocked` — list blocked accounts. @docs/blocked.md.
x) `hide-reply` — hide a reply to your post. @docs/hide-reply.md.

Analytics:
y) `likers` — users who liked a post. @docs/likers.md.
z) `reposters` — users who reposted a post. @docs/reposters.md.
aa) `quotes` — quote tweets of a post. @docs/quotes.md.
ab) `count` — count posts matching a query over time. @docs/count.md.
ac) `reposts-of-me` — reposts of your posts by others. @docs/reposts-of-me.md.

Discovery:
ad) `search-users` — search users by query. @docs/search-users.md.
ae) `trending` — trending topics (worldwide or personalized). @docs/trending.md.

[!CRITICAL-SEARCH-ROUTING] NEVER pass multiple terms to the `search` command. The `search` command sends its query verbatim to the X API — commas have NO special meaning in the X search syntax and will be treated as literal characters, producing a single unified phrase search that returns wrong results. When you have 2+ terms, ALWAYS use `batch-search --terms "term1,term2,..."`, which splits on commas and joins with the `OR` operator that the X API actually recognizes. This is the ONLY correct way to search for multiple terms.

[!RATE-LIMITING] `batch-search` packs terms into the minimum number of API calls and deduplicates results. Aim to stay under 50% of rate limits — if you need more than 3 queries, consider narrowing terms or adding `--context` to reduce result volume. Never fire search calls in parallel; `batch-search` handles sequential execution automatically.

[!CREDENTIALS] Four OAuth 1.0a variables are REQUIRED: `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`. They resolve from the first source that provides them: a) `.env.local` in cwd, b) `.env` in cwd, c) `.env.local` in the skill directory, d) `.env` in the skill directory, e) environment variables. Obtain them from the X Developer Console (Apps > Keys and tokens). One OPTIONAL variable: `X_API_BEARER_TOKEN` (OAuth 2.0 App-Only Bearer Token). When set, the client auto-selects Bearer auth for read endpoints that require it (e.g. full archive search with `--all`). Generate it from the X Developer Console (Apps > Keys and tokens > Bearer Token).
