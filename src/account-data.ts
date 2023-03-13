import * as BufferLayout from '@bbachain/buffer-layout';

export interface IAccountStateData {
  readonly typeIndex: number;
}

/**
 * @internal
 */
export type AccountType<TInputData extends IAccountStateData> = {
  /** The account type index (from bbachain upstream program) */
  index: number;
  /** The BufferLayout to use to build data */
  layout: BufferLayout.Layout<TInputData>;
};

/**
 * Decode account data buffer using an AccountType
 * @internal
 */
export function decodeData<TAccountStateData extends IAccountStateData>(
  type: AccountType<TAccountStateData>,
  data: Uint8Array,
): TAccountStateData {
  let decoded: TAccountStateData;
  try {
    decoded = type.layout.decode(data);
  } catch (err) {
    throw new Error('invalid instruction; ' + err);
  }

  if (decoded.typeIndex !== type.index) {
    throw new Error(
      `invalid account data; account type mismatch ${decoded.typeIndex} != ${type.index}`,
    );
  }

  return decoded;
}
