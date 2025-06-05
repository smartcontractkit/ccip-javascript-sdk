require('@nomicfoundation/hardhat-toolbox')
require('@nomicfoundation/hardhat-ethers')
require('@nomicfoundation/hardhat-viem')

require('chai')
require('mocha')
require('ethers')
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.24',
  solc: {
    version: '0.8.24',
  },
  paths: {
    sources: 'src/contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
}
