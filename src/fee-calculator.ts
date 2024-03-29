import * as BufferLayout from '@bbachain/buffer-layout';

/**
 * https://github.com/solana-labs/solana/blob/90bedd7e067b5b8f3ddbb45da00a4e9cabb22c62/sdk/src/fee_calculator.rs#L7-L11
 *
 * @internal
 */
export const FeeCalculatorLayout = BufferLayout.nu64('daltonsPerSignature');

/**
 * Calculator for transaction fees.
 *
 * @deprecated Deprecated since BBAChain v1.8.0.
 */
export interface FeeCalculator {
  /** Cost in daltons to validate a signature. */
  daltonsPerSignature: number;
}
