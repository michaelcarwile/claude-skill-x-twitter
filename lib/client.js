import { Client, OAuth1 } from "@xdevplatform/xdk";

export function createClient(config) {
  const oauth1 = new OAuth1({
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    callback: "oob",
    accessToken: config.accessToken,
    accessTokenSecret: config.accessTokenSecret,
  });

  const opts = { oauth1 };
  if (config.bearerToken) {
    opts.bearerToken = config.bearerToken;
  }

  return new Client(opts);
}
