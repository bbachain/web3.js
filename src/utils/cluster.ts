const endpoint = {
  http: {
    testnet: 'http://api-testnet.bbachain.com',
    mainnet: 'http://api-mainnet.bbachain.com',
  },
  https: {
    testnet: 'https://api-testnet.bbachain.com',
    mainnet: 'https://api-mainnet.bbachain.com',
  },
};

export type Cluster = 'testnet' | 'mainnet';

/**
 * Retrieves the RPC API URL for the specified cluster
 */
export function clusterApiUrl(cluster?: Cluster, tls?: boolean): string {
  const key = tls === false ? 'http' : 'https';

  if (!cluster) {
    return endpoint[key]['testnet'];
  }

  const url = endpoint[key][cluster];
  if (!url) {
    throw new Error(`Unknown ${key} cluster: ${cluster}`);
  }
  return url;
}
