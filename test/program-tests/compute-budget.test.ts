import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  Keypair,
  Connection,
  BBA_DALTON_UNIT,
  Transaction,
  ComputeBudgetProgram,
  ComputeBudgetInstruction,
  sendAndConfirmTransaction,
} from '../../src';
import {helpers} from '../mocks/rpc-http';
import {url} from '../url';

use(chaiAsPromised);

describe('ComputeBudgetProgram', () => {
  it('requestUnits', () => {
    const params = {
      units: 150000,
      additionalFee: BBA_DALTON_UNIT,
    };
    const ix = ComputeBudgetProgram.requestUnits(params);
    const decodedParams = ComputeBudgetInstruction.decodeRequestUnits(ix);
    expect(params).to.eql(decodedParams);
    expect(ComputeBudgetInstruction.decodeInstructionType(ix)).to.eq(
      'RequestUnits',
    );
  });

  it('requestHeapFrame', () => {
    const params = {
      bytes: 33 * 1024,
    };
    const ix = ComputeBudgetProgram.requestHeapFrame(params);
    const decodedParams = ComputeBudgetInstruction.decodeRequestHeapFrame(ix);
    expect(decodedParams).to.eql(params);
    expect(ComputeBudgetInstruction.decodeInstructionType(ix)).to.eq(
      'RequestHeapFrame',
    );
  });

  it('setComputeUnitLimit', () => {
    const params = {
      units: 50_000,
    };
    const ix = ComputeBudgetProgram.setComputeUnitLimit(params);
    const decodedParams =
      ComputeBudgetInstruction.decodeSetComputeUnitLimit(ix);
    expect(decodedParams).to.eql(params);
    expect(ComputeBudgetInstruction.decodeInstructionType(ix)).to.eq(
      'SetComputeUnitLimit',
    );
  });

  it('setComputeUnitPrice', () => {
    const params = {
      microDaltons: 100_000,
    };
    const ix = ComputeBudgetProgram.setComputeUnitPrice(params);
    const expectedParams = {
      ...params,
      microDaltons: BigInt(params.microDaltons),
    };
    const decodedParams =
      ComputeBudgetInstruction.decodeSetComputeUnitPrice(ix);
    expect(decodedParams).to.eql(expectedParams);
    expect(ComputeBudgetInstruction.decodeInstructionType(ix)).to.eq(
      'SetComputeUnitPrice',
    );
  });

  if (process.env.TEST_LIVE) {
    it('send live request heap ix', async () => {
      const connection = new Connection(url, 'confirmed');
      const STARTING_AMOUNT = 2 * BBA_DALTON_UNIT;
      const baseAccount = Keypair.generate();
      const basePubkey = baseAccount.publicKey;
      await helpers.airdrop({
        connection,
        address: basePubkey,
        amount: STARTING_AMOUNT,
      });

      async function expectRequestHeapFailure(bytes: number) {
        const requestHeapFrameTransaction = new Transaction().add(
          ComputeBudgetProgram.requestHeapFrame({bytes}),
        );
        await expect(
          sendAndConfirmTransaction(
            connection,
            requestHeapFrameTransaction,
            [baseAccount],
            {preflightCommitment: 'confirmed'},
          ),
        ).to.be.rejected;
      }
      const NOT_MULTIPLE_OF_1024 = 33 * 1024 + 1;
      const BELOW_MIN = 1024;
      const ABOVE_MAX = 257 * 1024;
      await expectRequestHeapFailure(NOT_MULTIPLE_OF_1024);
      await expectRequestHeapFailure(BELOW_MIN);
      await expectRequestHeapFailure(ABOVE_MAX);

      const VALID_BYTES = 33 * 1024;
      const requestHeapFrameTransaction = new Transaction().add(
        ComputeBudgetProgram.requestHeapFrame({bytes: VALID_BYTES}),
      );
      await sendAndConfirmTransaction(
        connection,
        requestHeapFrameTransaction,
        [baseAccount],
        {preflightCommitment: 'confirmed'},
      );
    });

    it('send live compute unit ixs', async () => {
      const connection = new Connection(url, 'confirmed');
      const FEE_AMOUNT = BBA_DALTON_UNIT;
      const STARTING_AMOUNT = 2 * BBA_DALTON_UNIT;
      const baseAccount = Keypair.generate();
      const basePubkey = baseAccount.publicKey;
      await helpers.airdrop({
        connection,
        address: basePubkey,
        amount: STARTING_AMOUNT,
      });

      // dalton fee = 2B * 1M / 1M = 2 BBA
      const prioritizationFeeTooHighTransaction = new Transaction()
        .add(
          ComputeBudgetProgram.setComputeUnitPrice({
            microDaltons: 2_000_000_000,
          }),
        )
        .add(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 1_000_000,
          }),
        );

      await expect(
        sendAndConfirmTransaction(
          connection,
          prioritizationFeeTooHighTransaction,
          [baseAccount],
          {preflightCommitment: 'confirmed'},
        ),
      ).to.be.rejected;

      // dalton fee = 1B * 1M / 1M = 1 BBA
      const validPrioritizationFeeTransaction = new Transaction()
        .add(
          ComputeBudgetProgram.setComputeUnitPrice({
            microDaltons: 1_000_000_000,
          }),
        )
        .add(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 1_000_000,
          }),
        );
      await sendAndConfirmTransaction(
        connection,
        validPrioritizationFeeTransaction,
        [baseAccount],
        {preflightCommitment: 'confirmed'},
      );
      expect(await connection.getBalance(baseAccount.publicKey)).to.be.at.most(
        STARTING_AMOUNT - FEE_AMOUNT,
      );
    });
  }
});
