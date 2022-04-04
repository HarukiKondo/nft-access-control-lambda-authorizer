const AWS = require('aws-sdk');
const AWSHttpProvider = require('./aws-web3-http-provider');
const utils = require('./utils');
const ethers = require('ethers');
const nodeId = process.env.nodeId;
const networkId = process.env.networkId;

const deployContract = async (tokenName,tokenTicker, s3URI) => {
    let endpoint = await utils.getHTTPendpoint(nodeId,networkId)
    endpoint = `https://${endpoint}`;
    const  baseProvider = new AWSHttpProvider(endpoint);
    const provider = new ethers.providers.Web3Provider(baseProvider);

//  retrieve the pvt key from ssm and generate a wallet address

    const pvtKey = await utils.getSSMParam(process.env.pvtkey)
    const  myWallet = new ethers.Wallet(pvtKey, provider);

    //create an instance of the contract

    const abi = require('./NFTSamples/NFT_BaseURI.json').abi;
    const bytecode = require('./NFTSamples/NFT_BaseURI.json').bytecode;

    //deploy smart contract
    console.log(tokenName, tokenTicker, s3URI)
    try {
        const factory = new ethers.ContractFactory(abi, bytecode, myWallet);
        const contract = await factory.deploy(tokenName, tokenTicker, s3URI);
        const txid = contract.deployTransaction.hash;

        return { "Transaction id" : txid, "ContractAddress": contract.address}
    } catch (error) {
     return {"Error": error};
    }
}    

module.exports = { deployContract:deployContract }
