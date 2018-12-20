const web3Read = require("./web3Read");
const getContractDetails = require("./getContractDetails");

module.exports = (name, address, network, cache = false) => {
  return new Promise((resolve, reject) => {
    const web3 = web3Read(network);
    if (address in global.contractInstances && !cache) {
      const contractInstance = global.contractInstances[address];
      resolve(contractInstance);
    } else {
      getContractDetails(name)
        .then(response => {
          const isCheckSummed = web3.utils.checkAddressChecksum(address);
          if (!isCheckSummed) {
            reject(new Error("Not a valid address"));
          } else {
            const contractInstance = new web3.eth.Contract(response, address);
            global.contractInstances[address] = contractInstance;
            resolve(contractInstance);
          }
        })
        .catch(err => reject(err.message));
    }
  });
};
