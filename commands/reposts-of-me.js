import { parseArgs, PAGINATION, RAW } from "../lib/args.js";
import {
  TWEET_FIELDS,
  TWEET_EXPANSIONS,
  TWEET_USER_FIELDS,
} from "../lib/fields.js";

export async function repostsOfMe(client, args) {
  const flags = parseArgs(args, {
    flags: { ...PAGINATION, ...RAW },
  });

  const options = {
    tweetFields: TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    userFields: TWEET_USER_FIELDS,
  };

  if (flags.maxResults !== undefined) options.maxResults = flags.maxResults;
  if (flags.nextToken !== undefined) options.paginationToken = flags.nextToken;

  const response = await client.users.getRepostsOfMe(options);
  return flags.raw ? response : (response.data ?? []);
}
