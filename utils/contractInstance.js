const web3Read = require("./web3Read");
const getContractDetails = require("./getContractDetails");

module.exports = (name, address, network) => {
  return new Promise((resolve, reject) => {
    const web3 = web3Read(network);
    getContractDetails(name)
      .then(async response => {
        try {
          const checkAddress = await web3.utils.toChecksumAddress(address);
          const contractInstance = new web3.eth.Contract(response, checkAddress);
          resolve(contractInstance);
        } catch (error) {
          reject(error.message);
        }
      })
      .catch(err => reject(err.message));
  });
};
