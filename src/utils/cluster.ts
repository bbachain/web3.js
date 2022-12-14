const endpoint = {
  http: {
    devnet: 'http://api-devnet.bbachain.net',
    testnet: 'http://api-testnet.bbachain.net',
    'mainnet-beta': 'http://api-mainnet.bbachain.net',
  },
  https: {
    devnet: 'https://api-devnet.bbachain.net',
    testnet: 'https://api-testnet.bbachain.net',
    'mainnet-beta': 'https://api-mainnet.bbachain.net',
  },
};

export type Cluster = 'devnet' | 'testnet' | 'mainnet-beta';

/**
 * Retrieves the RPC API URL for the specified cluster
 */
export function clusterApiUrl(cluster?: Cluster, tls?: boolean): string {
  const key = tls === false ? 'http' : 'https';

  if (!cluster) {
    return endpoint[key]['devnet'];
  }

  const url = endpoint[key][cluster];
  if (!url) {
    throw new Error(`Unknown ${key} cluster: ${cluster}`);
  }
  return url;
}
