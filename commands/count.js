import { parseArgs, TEMPORAL, RAW } from "../lib/args.js";

export async function count(client, args) {
  const flags = parseArgs(args, {
    positional: { key: "query", label: "A search query" },
    flags: {
      ...TEMPORAL,
      ...RAW,
      "--all": { key: "all", type: "boolean" },
      "--granularity": { key: "granularity", type: "string" },
      "--next-token": { key: "nextToken", type: "string" },
    },
  });

  const options = {};
  if (flags.startTime !== undefined) options.startTime = flags.startTime;
  if (flags.endTime !== undefined) options.endTime = flags.endTime;
  if (flags.granularity !== undefined) options.granularity = flags.granularity;
  if (flags.nextToken !== undefined) options.nextToken = flags.nextToken;

  const response = flags.all
    ? await client.posts.getCountsAll(flags.query, options)
    : await client.posts.getCountsRecent(flags.query, options);

  return flags.raw ? response : (response.data ?? []);
}
