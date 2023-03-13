const endpoint = {
  http: {
    devnet: 'http://api-devnet.bbachain.com',
    testnet: 'http://api-testnet.bbachain.com',
    'mainnet-beta': 'http://api-mainnet.bbachain.com/',
  },
  https: {
    devnet: 'https://api-devnet.bbachain.com',
    testnet: 'https://api-testnet.bbachain.com',
    'mainnet-beta': 'https://api-mainnet.bbachain.com/',
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
