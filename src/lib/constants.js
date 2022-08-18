export const ERROR_MESSAGES = {
  NODE_FETCHING_ERROR:
    "Something went wrong fetching the network info. Please, try again later.",
  TOO_MANY_REQUESTS: "Too many requests. Please, try again later.",
  SENDING_REQUEST: "Sending request...",
  OK: "OK",
};

export const IOTA_BENCH32HRP = "atoi";
export const IOTA_TOKEN_NAME = "IOTA";
export const SHIMMER_BENCH32HRP = "rms";
export const SHIMMER_TOKEN_NAME = "Shimmer";

export const KNOWN_NETWORK_PARAMS = [
  {
    tokenName: IOTA_TOKEN_NAME,
    bech32Hrp: IOTA_BENCH32HRP,
    logo: "iota.svg",
    favicon: "iota-fav.ico",
    illustration: "iota-illustration.svg",
  },
  {
    tokenName: SHIMMER_TOKEN_NAME,
    bech32Hrp: SHIMMER_BENCH32HRP,
    logo: "shimmer.svg",
    favicon: "shimmer-fav.ico",
    illustration: "shimmer-illustration.png",
  },
];
