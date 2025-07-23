/**
 * The default number of blocks to shift when querying logs for transfers.
 */
export const TRANSFER_STATUS_FROM_BLOCK_SHIFT = 100

/**
 * The ABI for the transfer status event on the off-ramp contract.
 * @dev This is used because of the enum type in the event.
 */
export const ExecutionStateChangedABI = {
  type: 'event',
  name: 'ExecutionStateChanged',
  inputs: [
    {
      name: 'sourceChainSelector',
      type: 'uint64',
      indexed: true,
      internalType: 'uint64',
    },
    {
      name: 'sequenceNumber',
      type: 'uint64',
      indexed: true,
      internalType: 'uint64',
    },
    {
      name: 'messageId',
      type: 'bytes32',
      indexed: true,
      internalType: 'bytes32',
    },
    {
      name: 'messageHash',
      type: 'bytes32',
      indexed: false,
      internalType: 'bytes32',
    },
    {
      name: 'state',
      type: 'uint8',
      indexed: false,
      internalType: 'enum Internal.MessageExecutionState',
    },
    {
      name: 'returnData',
      type: 'bytes',
      indexed: false,
      internalType: 'bytes',
    },
    {
      name: 'gasUsed',
      type: 'uint256',
      indexed: false,
      internalType: 'uint256',
    },
  ],
} as const
