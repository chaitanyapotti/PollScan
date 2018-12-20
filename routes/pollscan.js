var express = require("express");
var router = express.Router();
var fs = require("fs");

const pollscan_abi = JSON.parse(fs.readFileSync("./ABIs/pollScanABI.json"));
// var votingContractAddress = '0xce7ab7093a056598c53b5d87082c7019eb2275db'

/* Poll specific queries. */
router.get("/name", function(req, res, next) {
  if ("address" in req.query) {
    var votingContractAddress = req.query["address"];
    if (votingContractAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[votingContractAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, votingContractAddress);
      global.contractInstances[votingContractAddress] = contractInstance;
    }
    contractInstance.methods.getName().call(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      }
      res.json({ message: "Success", data: { name: web3.utils.hexToAscii(result).replace(/\0/g, "") } });
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/polltype", function(req, res, next) {
  if ("address" in req.query) {
    var votingContractAddress = req.query["address"];
    if (votingContractAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[votingContractAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, votingContractAddress);
      global.contractInstances[votingContractAddress] = contractInstance;
    }
    contractInstance.methods.getPollType().call(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      }
      res.json({ message: "Success", data: { polltype: web3.utils.hexToAscii(result).replace(/\0/g, "") } });
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/events", function(req, res, next) {
  if ("address" in req.query) {
    var votingContractAddress = req.query["address"];
    if (votingContractAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[votingContractAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, votingContractAddress);
      global.contractInstances[votingContractAddress] = contractInstance;
    }
    contractInstance.getPastEvents({ fromBlock: "3000000", toBlock: "latest" }, function(err, logs) {
      if (err) {
        console.log("printing error: ", err);
        res.status(500).json({ message: "Failed", reason: err.message });
        return;
      }
      // console.log('logs: ', logs)
      if (logs.length > 0) {
        getFirstAndLastBlockTimeStamp = async () => {
          let firstBlockDetails = await web3.eth.getBlock(logs[0]["blockNumber"]);
          let lastBlockDetails = await web3.eth.getBlock(logs[logs.length - 1]["blockNumber"]);
          // console.log(firstBlockDetails, lastBlockDetails)
          let activitiesArray = [];
          let m;
          let b;
          if (firstBlockDetails.number === lastBlockDetails.number) {
            m = 0;
            b = lastBlockDetails.timestamp;
          } else {
            m = -(lastBlockDetails.timestamp - firstBlockDetails.timestamp) / (firstBlockDetails.number - lastBlockDetails.number);
            b = lastBlockDetails.timestamp - m * lastBlockDetails.number;
          }

          for (let log of logs) {
            activitiesArray.push({
              type: log.event,
              weight: log.returnValues.voteWeight,
              value: log.returnValues._to,
              address: log.returnValues._from,
              datetime: parseInt(m * log.blockNumber + b)
            });
          }
          // blocktimes: { firstblockno: firstBlockDetails.number, firstblocktime: firstBlockDetails.timestamp, lastblockno: lastBlockDetails.number, lastblocktime: lastBlockDetails.timestamp }
          res.send({ message: "Success", data: { events: activitiesArray } });
        };
        getFirstAndLastBlockTimeStamp();

        // for (let log of logs){
        //     console.log(log)
        //     web3.eth.getBlock(log['blockNumber'], function(err, data){
        //         console.log(data)
        //     })
        // }
      } else {
        res.json({ message: "Failed", reason: "No logs available at the moment." });
      }
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/starttime", function(req, res, next) {
  if ("address" in req.query) {
    var votingContractAddress = req.query["address"];
    if (votingContractAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[votingContractAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, votingContractAddress);
      global.contractInstances[votingContractAddress] = contractInstance;
    }
    contractInstance.methods.getStartTime().call(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      }
      res.json({ message: "Success", data: { starttime: result } });
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/endtime", function(req, res, next) {
  if ("address" in req.query) {
    var votingContractAddress = req.query["address"];
    if (votingContractAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[votingContractAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, votingContractAddress);
      global.contractInstances[votingContractAddress] = contractInstance;
    }
    contractInstance.methods.getEndTime().call(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      }
      res.json({ message: "Success", data: { endtime: result } });
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/totalvotes", function(req, res, next) {
  if ("address" in req.query) {
    var votingContractAddress = req.query["address"];
    if (votingContractAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[votingContractAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, votingContractAddress);
      global.contractInstances[votingContractAddress] = contractInstance;
    }
    contractInstance.methods.getVoterBaseDenominator().call(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      }
      res.json({ message: "Success", data: { totalvotes: result } });
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/voterbaselogic", function(req, res, next) {
  if ("address" in req.query) {
    var votingContractAddress = req.query["address"];
    if (votingContractAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[votingContractAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, votingContractAddress);
      global.contractInstances[votingContractAddress] = contractInstance;
    }
    contractInstance.methods.getVoterBaseLogic().call(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      }
      res.json({ message: "Success", data: { voterbaselogic: web3.utils.hexToAscii(result).replace(/\0/g, "") } });
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/votetallies", function(req, res, next) {
  if ("address" in req.query) {
    var votingContractAddress = req.query["address"];
    if (votingContractAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[votingContractAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, votingContractAddress);
      global.contractInstances[votingContractAddress] = contractInstance;
    }
    contractInstance.methods.getVoteTallies().call(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      }
      res.json({ message: "Success", data: { votetallies: result } });
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/proposalswithvotes", function(req, res, next) {
  if ("address" in req.query) {
    var votingContractAddress = req.query["address"];
    if (votingContractAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[votingContractAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, votingContractAddress);
      global.contractInstances[votingContractAddress] = contractInstance;
    }
    contractInstance.methods.getProposals().call(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      }
      if (result) {
        contractInstance.methods.getVoterCounts().call(
          function(err, result) {
            if (err) {
              console.error(err);
              res.status(500).json({ message: "Failed", reason: err });
            }
            if (result) {
              var proposalsWithVotes = [];
              var totalVotesCasted = 0;
              for (proposal in this.proposals) {
                let proposalName = web3.utils
                  .hexToAscii(this.proposals[proposal])
                  .split(web3.utils.hexToAscii("0x00"))
                  .join("");
                if (proposalName.length > 0) {
                  proposalsWithVotes.push({
                    name: proposalName,
                    votes: result[proposal]
                  });
                  totalVotesCasted += parseInt(result[proposal]);
                }
              }
              res.json({
                message: "Success",
                data: {
                  proposalswithvotes: proposalsWithVotes,
                  totalvotescasted: totalVotesCasted
                }
              });
            }
          }.bind({ proposals: result })
        );
      }
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

module.exports = router;
