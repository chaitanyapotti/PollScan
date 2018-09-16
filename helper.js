var express = require('express')
var Web3 = require('web3')
var HDWalletProvider = require("truffle-hdwallet-provider")
const testnet = `https://kovan.infura.io/v3/894765ed26c2470587b00e37249612e4`
var voting_contract_address = '0xce7ab7093a056598c53b5d87082c7019eb2275db'
var abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_to",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "voteWeight",
                "type": "uint256"
            }
        ],
        "name": "RevokedVote",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "revokeVote",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_to",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "voteWeight",
                "type": "uint256"
            }
        ],
        "name": "TriedToVote",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_to",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "voteWeight",
                "type": "uint256"
            }
        ],
        "name": "CastVote",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_proposal",
                "type": "uint8"
            }
        ],
        "name": "vote",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_protocolAddresses",
                "type": "address[]"
            },
            {
                "name": "_proposalNames",
                "type": "bytes32[]"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "calculateVoteWeight",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "canVote",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getName",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getPollType",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getProposals",
        "outputs": [
            {
                "name": "",
                "type": "bytes32[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getProtocolAddresses",
        "outputs": [
            {
                "name": "",
                "type": "address[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getVoterBaseLogic",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_proposalId",
                "type": "uint256"
            }
        ],
        "name": "getVoterCount",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getVoterCounts",
        "outputs": [
            {
                "name": "",
                "type": "uint256[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getVoteTallies",
        "outputs": [
            {
                "name": "",
                "type": "uint256[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_proposalId",
                "type": "uint256"
            }
        ],
        "name": "getVoteTally",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "pollName",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "pollType",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "proposals",
        "outputs": [
            {
                "name": "voteCount",
                "type": "uint256"
            },
            {
                "name": "voteWeight",
                "type": "uint256"
            },
            {
                "name": "name",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "protocolAddresses",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "voterBaseLogic",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "voters",
        "outputs": [
            {
                "name": "voted",
                "type": "bool"
            },
            {
                "name": "vote",
                "type": "uint8"
            },
            {
                "name": "delegate",
                "type": "address"
            },
            {
                "name": "weight",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "winningProposal",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]

const provider = new HDWalletProvider(
    
    process.env.ACCOUNT_WORDS,
    testnet
    );

const web3 = new Web3(provider)

var contractInstance =  new web3.eth.Contract(abi, voting_contract_address)

