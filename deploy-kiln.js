// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const ethers = require("ethers");
const fs = require("fs");
const { privateKey, privateKeyTest, bscscanApiKey } = require('./secrets.json');

async function main() {
  let contracts = [];

  for (let i = 0; i < 110; i++) {
    // Use your wallet's private key to deploy the contract
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.kiln.themerge.dev')
    const wallet = new ethers.Wallet(privateKey, provider)

    // Read the contract artifact, which was generated by Remix
    const metadata = JSON.parse(fs.readFileSync('./artifacts/contracts/HelloWorld.sol/HelloWorld.json').toString())

    // Set gas limit and gas price, using the default Ropsten provider
    // const price = ethers.utils.formatUnits(await provider.getGasPrice(), 'gwei')
    // const options = {gasLimit: 100000, gasPrice: ethers.utils.parseUnits(price, 'gwei')}

    // Deploy the contract
    const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet)
    const contract = await factory.deploy()
    await contract.deployed()
    console.log(i+1, contract.address)

    contracts.push(contract);
  }

  // Add 1 time to prevent failure
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 11; j++) {
      await contracts[i].hello().then(tx => tx.wait());
      console.log(i+1, j+1);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
