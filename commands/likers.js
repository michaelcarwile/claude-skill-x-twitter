import { parseArgs, PAGINATION, RAW } from "../lib/args.js";
import { USER_FIELDS } from "../lib/fields.js";

export async function likers(client, args) {
  const flags = parseArgs(args, {
    positional: { key: "tweetId", label: "A tweet ID" },
    flags: { ...PAGINATION, ...RAW },
  });

  const options = { userFields: USER_FIELDS };
  if (flags.maxResults !== undefined) options.maxResults = flags.maxResults;
  if (flags.nextToken !== undefined) options.paginationToken = flags.nextToken;

  const response = await client.posts.getLikingUsers(flags.tweetId, options);
  return flags.raw ? response : (response.data ?? []);
}
