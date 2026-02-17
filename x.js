import { dirname } from "path";
import { fileURLToPath } from "url";
import { loadConfig } from "./lib/config.js";
import { createClient } from "./lib/client.js";

import { me } from "./commands/me.js";
import { search } from "./commands/search.js";
import { get } from "./commands/get.js";
import { post } from "./commands/post.js";
import { del } from "./commands/delete.js";
import { like, unlike } from "./commands/like.js";
import { repost, unrepost } from "./commands/repost.js";
import { user } from "./commands/user.js";
import { follow, unfollow } from "./commands/follow.js";
import { followers, following } from "./commands/followers.js";
import { timeline } from "./commands/timeline.js";
import { mentions } from "./commands/mentions.js";
import { bookmark, unbookmark, bookmarks } from "./commands/bookmark.js";
import { mute, unmute, muted } from "./commands/mute.js";
import { blocked } from "./commands/blocked.js";
import { hideReply } from "./commands/hide-reply.js";
import { likers } from "./commands/likers.js";
import { reposters } from "./commands/reposters.js";
import { quotes } from "./commands/quotes.js";
import { count } from "./commands/count.js";
import { repostsOfMe } from "./commands/reposts-of-me.js";
import { searchUsers } from "./commands/search-users.js";
import { trending } from "./commands/trending.js";
import { batchSearch } from "./commands/batch-search.js";

const commands = {
  me,
  search,
  "batch-search": batchSearch,
  get,
  post,
  delete: del,
  like,
  unlike,
  repost,
  unrepost,
  user,
  follow,
  unfollow,
  followers,
  following,
  timeline,
  mentions,
  bookmark,
  unbookmark,
  bookmarks,
  mute,
  unmute,
  muted,
  blocked,
  "hide-reply": hideReply,
  likers,
  reposters,
  quotes,
  count,
  "reposts-of-me": repostsOfMe,
  "search-users": searchUsers,
  trending,
};

const COMMAND_NAMES = Object.keys(commands).join(", ");

const skillDir = dirname(fileURLToPath(import.meta.url));

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || !commands[command]) {
    console.error(`Usage: x <command> [args]\nCommands: ${COMMAND_NAMES}`);
    process.exitCode = 1;
    return;
  }

  const config = loadConfig(skillDir);
  const client = createClient(config);
  const result = await commands[command](client, args);

  if (result !== undefined) {
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  // Extract useful details from xdk HTTP errors
  if (error.status) {
    console.error(`Error: HTTP ${error.status}`);
    if (error.body) {
      try {
        console.error(JSON.stringify(error.body, null, 2));
      } catch {
        console.error(error.body);
      }
    } else {
      console.error(error.message || String(error));
    }
  } else {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  process.exitCode = 1;
});
