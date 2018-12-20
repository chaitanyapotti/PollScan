const Web3 = require("web3");

const kovanInfura = new Web3("https://kovan.infura.io/v3/dc22c9c6245742069d5fe663bfa8a698");
const rinkebyInfura = new Web3("https://rinkeby.infura.io/v3/dc22c9c6245742069d5fe663bfa8a698");
const mainnetInfura = new Web3("https://mainnet.infura.io/v3/dc22c9c6245742069d5fe663bfa8a698");
const localNetwork = new Web3("http://127.0.0.1:7545");

const web3Read = function(network) {
  switch (network) {
    case "rinkeby":
      return rinkebyInfura;
    case "kovan":
      return kovanInfura;
    case "main":
      return mainnetInfura;
    case "private":
    default:
      return localNetwork;
  }
};

module.exports = web3Read;
