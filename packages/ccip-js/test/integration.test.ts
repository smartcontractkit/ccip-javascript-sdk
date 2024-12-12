import { jest, expect, it, describe, afterEach } from '@jest/globals'
import * as CCIP from '../src/api'
import * as Viem from 'viem'
import * as viemActions from 'viem/actions'
import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  getContract,
  parseEther,
  zeroAddress,
} from 'viem'

import { testClient } from './helpers/clients'
import {
  account,
  ccipLog,
  ccipTxHash,
  ccipTxReceipt,
  onRampAbi,
  routerAbi,
} from './helpers/constants'
import { getContracts, setOnRampAddress } from './helpers/contracts'
// getSupportedFeeTokens
import { mineBlock } from './helpers/utils'

import { expect as expectChai } from 'chai'
import { getSupportedFeeTokens } from './helpers/config'
// import { readContract } from 'viem/actions'
// import { getTokenAdminRegistry } from './helpers/config'

const ccipClient = CCIP.createClient()
const isFork = false

const readContractMock = jest.spyOn(viemActions, 'readContract')
const writeContractMock = jest.spyOn(viemActions, 'writeContract')
const waitForTransactionReceiptMock = jest.spyOn(viemActions, 'waitForTransactionReceipt')
const parseEventLogsMock = jest.spyOn(Viem, 'parseEventLogs')

describe('Integration', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('√ deploy on HH', () => {
    it("Should Deploy Router.sol", async function () {
      const { router } = await getContracts()
      expectChai(router.address).to.not.equal(0);
    });
    it("Should Deploy BridgeToken.sol", async function () {
      const { bridgeToken } = await getContracts()
      expectChai(bridgeToken.address).to.not.equal(0);
    });
    it("Should Deploy CCIPLocalSimulator.sol", async function () {
      const { localSimulator } = await getContracts()
      expectChai(localSimulator.address).to.not.equal(0);
    })

    console.log('\u2705 | Deployed Smart Contracts on local Hardhat')
  })

  describe('√ approve', () => {

    it('√ should succeed with valid input', async () => {
      const { bridgeToken, localSimulator, router } = await getContracts()

      writeContractMock.mockResolvedValueOnce(ccipTxHash)
      waitForTransactionReceiptMock.mockResolvedValue(ccipTxReceipt)
      const approvedAmount = parseEther('10')

      // HH: Approval Transaction
      await bridgeToken.write.approve([
        router.address,     // spender
        approvedAmount      // amount
      ])

      // CCIP: Approval Transaction
      const ccipApprove = await ccipClient.approveRouter({
        client: testClient,
        routerAddress: router.address,
        amount: approvedAmount,
        tokenAddress: bridgeToken.address,
        waitForReceipt: true,
      })

      expect(ccipApprove).toStrictEqual({ txHash: ccipTxHash, txReceipt: ccipTxReceipt })

      console.log('\u2705 | Approves with valid input')
    })

    it('√ should get txReceipt if approve invoked with waitForReceipt', async () => {
      // writeContractMock.mockResolvedValueOnce(ccipTxHash)
      // waitForTransactionReceiptMock.mockResolvedValue(ccipTxReceipt)
      const { bridgeToken, localSimulator, router } = await getContracts()
      const approvedAmount = parseEther('0')

      const { txReceipt } = await ccipClient.approveRouter({
        client: testClient,
        routerAddress: router.address,
        amount: approvedAmount,
        tokenAddress: bridgeToken.address,
        waitForReceipt: true,
      })

      // @ts-ignore
      const txHash = txReceipt.transactionHash
      expect(txHash).toStrictEqual(ccipTxHash)
      console.log('\u2705 | Gets txReceipt if approve invoked with waitForReceipt')
    })

    it('√ should not get txReceipt if approve invoked without waitForReceipt', async () => {
      writeContractMock.mockResolvedValueOnce(ccipTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(ccipTxReceipt)
      const { router } = await getContracts()

      const { txReceipt } = await ccipClient.approveRouter({
        client: testClient,
        routerAddress: router.address,
        amount: 0n,
        tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
      })

      expect(txReceipt).toBe(undefined)
      console.log('\u2705 | Does not get txReceipt if approve invoked without waitForReceipt')
    })
  })

  describe('√ getAllowance', () => {
    it('√ should return the allowance for a given account', async () => {
      writeContractMock.mockResolvedValueOnce(ccipTxHash)
      waitForTransactionReceiptMock.mockResolvedValue(ccipTxReceipt)
      const { bridgeToken, router } = await getContracts()
      const approvedAmount = parseEther('10')

      // HH: Approval Transaction
      await bridgeToken.write.approve([
        router.address,     // spender
        approvedAmount      // amount
      ])

      mineBlock(isFork)

      const hhApprovedAmount = await bridgeToken.read.allowance([
        account.address,  // owner
        router.address    // spender
      ])

      await ccipClient.approveRouter({
        client: testClient,
        routerAddress: router.address,
        amount: approvedAmount,
        tokenAddress: bridgeToken.address,
        waitForReceipt: true,
      })

      const ccipApprovedAmount = await bridgeToken.read.allowance([
        account.address,  // owner
        router.address    // spender
      ])

      expect(hhApprovedAmount).toBe(approvedAmount)
      expect(ccipApprovedAmount).toBe(approvedAmount)
      expect(hhApprovedAmount).toBe(ccipApprovedAmount)

      console.log('\u2705 | Returns the allowance for a given account')
    })
  })

  describe('√ getOnRampAddress', () => {

    it('√ should return the address of the onRamp contract', async () => {
      const { router } = await getContracts()
      const expectedOnRampAddress = '0x8F35B097022135E0F46831f798a240Cc8c4b0B01'
      // HH OnRamp Address
      const hhOnRampAddress = await setOnRampAddress({
        destinationChainSelector: '14767482510784806043',
      })
      mineBlock(isFork)
      readContractMock.mockResolvedValueOnce('0x8F35B097022135E0F46831f798a240Cc8c4b0B01')

      // CCIP OnRamp Address
      const ccipOnRampAddress = await ccipClient.getOnRampAddress({
        client: testClient,
        routerAddress: router.address,
        destinationChainSelector: '14767482510784806043',
      })

      expect(hhOnRampAddress).toBe(expectedOnRampAddress)
      expect(ccipOnRampAddress).toBe(expectedOnRampAddress)
      expect(hhOnRampAddress).toBe(ccipOnRampAddress)
      console.log('\u2705 | Returns the address of the onRamp contract')
    })
  })

  describe('√ getSupportedFeeTokens', () => {

    it('√ should return supported fee tokens for valid chains', async () => {
      const { router } = await getContracts()
      const supportedFeeTokens = [
        '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        '0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534',
        '0xc4bF5CbDaBE595361438F8c6a187bDc330539c60',
      ]

      const readContractMock = jest.spyOn(viemActions, 'readContract')
      readContractMock.mockResolvedValueOnce('0x8F35B097022135E0F46831f798a240Cc8c4b0B01')
      readContractMock.mockResolvedValueOnce({ priceRegistry: '0x9EF7D57a4ea30b9e37794E55b0C75F2A70275dCc' })
      readContractMock.mockResolvedValueOnce(supportedFeeTokens)

      const hhSupportedFeeTokens = await getSupportedFeeTokens()
      mineBlock(isFork)

      const ccipSupportedFeeTokens = await ccipClient.getSupportedFeeTokens({
        client: testClient,
        routerAddress: router.address,
        destinationChainSelector: "16015286601757825753",
      })

      expect(hhSupportedFeeTokens).toStrictEqual(supportedFeeTokens)
      expect(ccipSupportedFeeTokens).toStrictEqual(supportedFeeTokens)
      expect(ccipSupportedFeeTokens).toStrictEqual(hhSupportedFeeTokens)
      console.log('\u2705 | Returns supported fee tokens for valid chains.')
    })
  })

  // describe('getFee', () => {

  //   it('should return the correct fee for a transfer', async () => {
  //     const { router } = await getContracts()
  //     const expectedFee = 300000000000000n
  //     readContractMock.mockResolvedValueOnce(expectedFee)
  //     const data = encodeFunctionData({
  //       abi: CCIP.IERC20ABI,
  //       functionName: 'transfer',
  //       args: [Viem.zeroAddress, Viem.parseEther('0.12')],
  //     })
  //     const hhFee = await router.read.getFee([
  //       '14767482510784806043',   // destinationChainSelector: '14767482510784806043',
  //       encodeAbiParameters([{ type: 'string', name: 'data' }], ["Hello"])   // data: encodeAbiParameters([{ type: 'string', name: 'data' }], ["Hello"])
  //     ]) as bigint
  //     mineBlock(isFork)
  //     console.log({ hhFee })
  //     const ccipFee = await ccipClient.getFee({
  //       client: testClient,
  //       routerAddress: router.address,
  //       destinationChainSelector: '14767482510784806043',
  //       destinationAccount: zeroAddress,
  //       amount: 1000000000000000000n,
  //       tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
  //     })
  //     console.log({ ccipFee })
  //     // expect(ccipFee).toEqual(expectedFee)
  //   })
  // })

  // describe('getTokenAdminRegistry', () => {
  //   it('should return token admin registry', async () => {
  //     const routerAddress = router.address
  //     // await expect(
  //     // async () => {
  //     // const tokenAdminRegistry = await ccipClient.getTokenAdminRegistry({
  //     //   client: testClient,
  //     //   routerAddress: routerAddress,
  //     //   destinationChainSelector: '14767482510784806043',
  //     //   tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
  //     // })
  //     // console.log({tokenAdminRegistry})
  //     // expect(tokenAdminRegistry).toBe('0x95F29FEE11c5C55d26cCcf1DB6772DE953B37B82')
  //     // }
  //     // ).rejects.toThrow('Router address 0x0000000000000000000000000000000000000000 is not valid')
  //   })
  // })

  describe('isTokenSupported', () => {
    it('should return true if token is supported', async () => {
      const { router } = await getContracts()

      readContractMock.mockResolvedValueOnce('0x12492154714fBD28F28219f6fc4315d19de1025B')
      readContractMock.mockResolvedValueOnce({
        linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        chainSelector: 16015286601757825753n,
        destChainSelector: 14767482510784806043n,
        defaultTxGasLimit: 200000n,
        maxNopFeesJuels: 100000000000000000000000000n,
        prevOnRamp: '0x0477cA0a35eE05D3f9f424d88bC0977ceCf339D4',
        rmnProxy: '0xba3f6251de62dED61Ff98590cB2fDf6871FbB991',
        tokenAdminRegistry: '0x95F29FEE11c5C55d26cCcf1DB6772DE953B37B82',
      })
      readContractMock.mockResolvedValueOnce('0xF081aCC599dFD65cdFD43934d2D8e2C7ad0277aE')
      readContractMock.mockResolvedValueOnce(true)

      // const hhTokenSupported = await router.read.isTokenSupported([
      //   '14767482510784806043',
      //   '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
      // ])

      // console.log({ hhTokenSupported })
      const ccipTokenSupported = await ccipClient.isTokenSupported({
        client: testClient,
        routerAddress: router.address,
        destinationChainSelector: '14767482510784806043',
        tokenAddress: '0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05',
      })

      expect(ccipTokenSupported).toBe(true)
    })
  })

  describe('transferTokens', () => {
    it('should successfully transfer tokens with minimal input', async () => {
      const { router } = await getContracts()
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(ccipTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(ccipTxReceipt)
      parseEventLogsMock.mockReturnValue(ccipLog as never)
      mineBlock(isFork)

      // const hhTransfer = await router.write.ccipSend([
      //   14767482510784806043n,  // destinationChainSelector
      //   zeroAddress             // destinationAccount
      // ])
      // mineBlock(isFork)
      // console.log({ hhTransfer })

      const transfer = await ccipClient.transferTokens({
        client: testClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: zeroAddress,
        tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        amount: 1000000000000000000n,
      })
      expect(transfer.txHash).toEqual('0xc55d92b1212dd24db843e1cbbcaebb1fffe3cd1751313e0fd02cf26bf72b359e')
      expect(transfer.messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
      expect(transfer.txReceipt.blockHash).toEqual('0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b')
    })

    it('should successfully transfer tokens with all inputs', async () => {
      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(ccipTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(ccipTxReceipt)
      parseEventLogsMock.mockReturnValue(ccipLog as never)

      const transfer = await ccipClient.transferTokens({
        client: testClient,
        routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
        destinationChainSelector: '14767482510784806043',
        destinationAccount: Viem.zeroAddress,
        tokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        amount: 1000000000000000000n,
        data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
      })
      expect(transfer.txHash).toEqual('0xc55d92b1212dd24db843e1cbbcaebb1fffe3cd1751313e0fd02cf26bf72b359e')
      expect(transfer.messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
      expect(transfer.txReceipt.blockHash).toEqual('0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b')
    })
  })
  describe('sendCCIPMessage', () => {

    it('should successfully send message', async () => {
      const { router } = await getContracts()

      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(ccipTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(ccipTxReceipt)
      parseEventLogsMock.mockReturnValue(ccipLog as never)

      const transfer = await ccipClient.sendCCIPMessage({
        client: testClient,
        routerAddress: router.address,
        destinationChainSelector: '14767482510784806043',
        destinationAccount: zeroAddress,
        data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
      })
      expect(transfer.txHash).toEqual(ccipTxHash)
      expect(transfer.messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
      expect(transfer.txReceipt.blockHash).toEqual('0x565f99df4e32e15432f44c19b3d1d15447c41ca185a09aaf8d53356ce4086d8b')
    })

    it('should get messageId on sendCCIPMessage', async () => {
      const { bridgeToken, localSimulator, router } = await getContracts()

      readContractMock.mockResolvedValueOnce(300000000000000n)
      writeContractMock.mockResolvedValueOnce(ccipTxHash)
      waitForTransactionReceiptMock.mockResolvedValueOnce(ccipTxReceipt)
      parseEventLogsMock.mockReturnValue(ccipLog as never)

      const { messageId } = await ccipClient.sendCCIPMessage({
        client: testClient,
        routerAddress: router.address,
        destinationChainSelector: '14767482510784806043',
        destinationAccount: zeroAddress,
        feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
        data: Viem.encodeAbiParameters([{ type: 'string', name: 'data' }], ['Hello']),
      })
      expect(messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
    })
  })
  it('should send message with a function as data', async () => {
    const { bridgeToken, localSimulator, router } = await getContracts()

    readContractMock.mockResolvedValueOnce(300000000000000n)
    writeContractMock.mockResolvedValueOnce(ccipTxHash)
    waitForTransactionReceiptMock.mockResolvedValueOnce(ccipTxReceipt)
    parseEventLogsMock.mockReturnValue(ccipLog as never)

    const { messageId } = await ccipClient.sendCCIPMessage({
      client: testClient,
      routerAddress: router.address,
      destinationChainSelector: '14767482510784806043',
      destinationAccount: Viem.zeroAddress,
      feeTokenAddress: '0x94095e6514411C65E7809761F21eF0febe69A977',
      data: Viem.encodeFunctionData({
        abi: CCIP.IERC20ABI,
        functionName: 'transfer',
        args: [Viem.zeroAddress, Viem.parseEther('0.12')],
      }),
    })
    expect(messageId).toEqual('0xde438245515b78c2294263a821316b5d5b49af90464dafcedaf13901050bf062')
  })
})
