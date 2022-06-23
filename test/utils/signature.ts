import { HttpProvider } from "web3/providers";
import { getMessage } from 'eip-712';
import { Signature, Wallet, Signer, utils } from 'ethers';

import { abi as AxelarSeaProjectRegistryABI } from '../../artifacts/contracts/mint/AxelarSeaProjectRegistry.sol/AxelarSeaProjectRegistry.json';

interface SignatureWithFunctionSignature extends Signature {
  functionSignature: string;
  nonce: string;
}

export async function generateSignature(privateKey: string, contractAddress: string, name: string, functionSignature: string, chainId: string | number): Promise<SignatureWithFunctionSignature> {
  const wallet = new Wallet(privateKey);
  const account = await wallet.getAddress();

  // console.log('Contract Address', contractAddress);
  // console.log('Account', account);
  // console.log('Function Signature', functionSignature);

  // try to gather a signature for permission
  const nonce = Date.now().toString() + Math.floor(Math.random() * 1000).toString();

  const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ]

  const domain = {
    name: name,
    version: '1',
    chainId,
    verifyingContract: contractAddress,
  }

  const MetaTransaction = [
    { name: 'nonce', type: 'uint256' },
    { name: 'from', type: 'address' },
    { name: 'functionSignature', type: 'bytes' },
  ]
  const message = {
    nonce,
    from: account,
    functionSignature
  }
  const typedData = {
    types: {
      EIP712Domain,
      MetaTransaction,
    },
    domain,
    primaryType: 'MetaTransaction',
    message,
  }

  // Get a signable message from the typed data
  const signingKey = new utils.SigningKey(privateKey);
  const typedMessage = getMessage(typedData, true);
  let signature = signingKey.signDigest(typedMessage);

  return {
    ...signature,
    functionSignature: functionSignature,
    nonce: nonce,
  }
}

export async function generateNewProjectSignature(privateKey: string, contractAddress: string, chainId: string | number, owner: string, projectId: string): Promise<SignatureWithFunctionSignature> {
  let iface = new utils.Interface(AxelarSeaProjectRegistryABI);
  const functionSignature = iface.encodeFunctionData("newProject", [ owner, projectId ])
  return await generateSignature(privateKey, contractAddress, "AxelarSeaProjectRegistry", functionSignature, chainId);
}

// export async function generateNewProjectSignature(wallet: Signer, contractAddress: string, chainId: string | number, owner: string, projectId: string): Promise<SignatureWithFunctionSignature> {
//   let iface = new utils.Interface(AxelarSeaProjectRegistryABI);
//   const functionSignature = iface.encodeFunctionData("newProject", [ owner, projectId ])
//   return await generateSignature(wallet, contractAddress, "AxelarSeaProjectRegistry", functionSignature, chainId);
// }