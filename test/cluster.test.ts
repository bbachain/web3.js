import {expect} from 'chai';

import {clusterApiUrl} from '../src/utils/cluster';

describe('Cluster Util', () => {
  it('invalid', () => {
    expect(() => {
      clusterApiUrl('abc123' as any);
    }).to.throw();
  });

  it('testnet', () => {
    expect(clusterApiUrl()).to.eq('https://api-testnet.bbachain.com');
    expect(clusterApiUrl('testnet')).to.eq('https://api-testnet.bbachain.com');
    expect(clusterApiUrl('testnet', true)).to.eq(
      'https://api-testnet.bbachain.com',
    );
    expect(clusterApiUrl('testnet', false)).to.eq(
      'http://api-testnet.bbachain.com',
    );
  });
});
