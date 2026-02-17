import { parseArgs, PAGINATION, TEMPORAL, RAW } from "../lib/args.js";
import {
  TWEET_FIELDS,
  TWEET_EXPANSIONS,
  TWEET_USER_FIELDS,
} from "../lib/fields.js";

export async function search(client, args) {
  const flags = parseArgs(args, {
    positional: { key: "query", label: "A search query" },
    flags: {
      ...PAGINATION,
      ...TEMPORAL,
      ...RAW,
      "--all": { key: "all", type: "boolean" },
      "--sort": { key: "sortOrder", type: "string" },
      "--since-id": { key: "sinceId", type: "string" },
      "--until-id": { key: "untilId", type: "string" },
      "--fields": { key: "tweetFields", type: "string[]" },
    },
    defaults: { tweetFields: TWEET_FIELDS },
  });

  const options = {
    tweetFields: flags.tweetFields,
    expansions: TWEET_EXPANSIONS,
    userFields: TWEET_USER_FIELDS,
  };

  if (flags.maxResults !== undefined) options.maxResults = flags.maxResults;
  if (flags.sortOrder !== undefined) options.sortOrder = flags.sortOrder;
  if (flags.startTime !== undefined) options.startTime = flags.startTime;
  if (flags.endTime !== undefined) options.endTime = flags.endTime;
  if (flags.sinceId !== undefined) options.sinceId = flags.sinceId;
  if (flags.untilId !== undefined) options.untilId = flags.untilId;
  if (flags.nextToken !== undefined) options.nextToken = flags.nextToken;

  const response = flags.all
    ? await client.posts.searchAll(flags.query, options)
    : await client.posts.searchRecent(flags.query, options);

  return flags.raw ? response : (response.data ?? []);
}
