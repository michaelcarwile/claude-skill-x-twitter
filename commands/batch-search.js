import { parseArgs, TEMPORAL, RAW } from "../lib/args.js";
import {
  TWEET_FIELDS,
  TWEET_EXPANSIONS,
  TWEET_USER_FIELDS,
} from "../lib/fields.js";

const MAX_QUERY_LENGTH = 512;
const DEFAULT_EXCLUDES = ["-is:retweet", "-is:reply"];

function quoteIfNeeded(term) {
  const t = term.trim();
  if (t.includes(" ") && !t.startsWith('"')) return `"${t}"`;
  return t;
}

export function buildQueries(flags) {
  const terms = flags.terms.map(quoteIfNeeded);
  if (terms.length === 0) throw new Error("--terms is required");

  // Build the static suffix parts
  const suffixParts = [];

  // Context clause: (ctx1 OR ctx2)
  if (flags.context.length > 0) {
    const contextTerms = flags.context.map(quoteIfNeeded);
    suffixParts.push(`(${contextTerms.join(" OR ")})`);
  }

  // Excludes — deduplicate defaults against user-supplied
  const allExcludes = new Set();
  if (!flags.noDefaultExclude) {
    for (const e of DEFAULT_EXCLUDES) allExcludes.add(e);
  }
  for (const e of flags.exclude) {
    const neg = e.startsWith("-") ? e : `-${e}`;
    allExcludes.add(neg);
  }
  for (const e of allExcludes) suffixParts.push(e);

  const suffix = suffixParts.length > 0 ? " " + suffixParts.join(" ") : "";

  // Available space for the (term1 OR term2) group per query
  // 2 chars reserved for wrapping parens: "(" and ")"
  const budget = MAX_QUERY_LENGTH - suffix.length - 2;
  if (budget < 1) {
    throw new Error(
      "Exclude/context clause is too long to fit within the 512-char query limit.",
    );
  }

  // Greedy-pack terms into groups
  const groups = [];
  let current = [];
  let currentLen = 0;

  for (const term of terms) {
    const addition =
      current.length === 0 ? term.length : " OR ".length + term.length;
    if (currentLen + addition > budget && current.length > 0) {
      groups.push(current);
      current = [term];
      currentLen = term.length;
    } else {
      current.push(term);
      currentLen += addition;
    }
  }
  if (current.length > 0) groups.push(current);

  // Build final query strings
  return groups.map((group) => {
    const termsClause =
      group.length === 1 ? group[0] : `(${group.join(" OR ")})`;
    return (termsClause + suffix).trim();
  });
}

export async function batchSearch(client, args) {
  const flags = parseArgs(args, {
    flags: {
      "--terms": { key: "terms", type: "string[]" },
      "--context": { key: "context", type: "string[]" },
      "--exclude": { key: "exclude", type: "string[]" },
      "--no-default-exclude": { key: "noDefaultExclude", type: "boolean" },
      "--all": { key: "all", type: "boolean" },
      "--sort": { key: "sortOrder", type: "string" },
      "--max-results": { key: "maxResults", type: "number" },
      "--since-id": { key: "sinceId", type: "string" },
      "--until-id": { key: "untilId", type: "string" },
      ...TEMPORAL,
      ...RAW,
    },
    defaults: { terms: [], context: [], exclude: [] },
  });

  if (flags.terms.length === 0) {
    throw new Error(
      "--terms is required. Provide comma-separated search terms.",
    );
  }

  const queries = buildQueries(flags);

  const options = {
    tweetFields: TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    userFields: TWEET_USER_FIELDS,
  };

  if (flags.maxResults !== undefined) options.maxResults = flags.maxResults;
  if (flags.sortOrder !== undefined) options.sortOrder = flags.sortOrder;
  if (flags.startTime !== undefined) options.startTime = flags.startTime;
  if (flags.endTime !== undefined) options.endTime = flags.endTime;
  if (flags.sinceId !== undefined) options.sinceId = flags.sinceId;
  if (flags.untilId !== undefined) options.untilId = flags.untilId;

  // Execute queries sequentially to avoid rate-limit bursts
  const allTweets = [];
  const allUsers = [];
  const seenIds = new Set();

  for (const query of queries) {
    const response = flags.all
      ? await client.posts.searchAll(query, options)
      : await client.posts.searchRecent(query, options);

    const tweets = response.data ?? [];
    for (const tweet of tweets) {
      if (!seenIds.has(tweet.id)) {
        seenIds.add(tweet.id);
        allTweets.push(tweet);
      }
    }

    // Merge expanded users
    const users = response.includes?.users;
    if (users) {
      for (const u of users) {
        if (!allUsers.some((existing) => existing.id === u.id)) {
          allUsers.push(u);
        }
      }
    }
  }

  // Sort by createdAt descending
  allTweets.sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return b.created_at.localeCompare(a.created_at);
  });

  if (flags.raw) {
    return {
      data: allTweets,
      includes: { users: allUsers },
      meta: {
        result_count: allTweets.length,
        queries_used: queries.length,
      },
    };
  }

  return allTweets;
}
