var express = require("express");
var router = express.Router();
const contractInstance = require("../utils/contractInstance");
const web3Read = require("../utils/web3Read");

// var votingContractAddress = '0xECB97498Ff0C1A25E1280959b2cD7E06D32F8bAf' - main
// 0x95d0fFEa1400584d85ae2533917DB058059D8046 - rinkeby

/* Poll specific queries. */
router.get("/name", async (req, res, next) => {
  if ("address" in req.query && "network" in req.query) {
    const web3 = web3Read(req.query.network);
    const instance = await contractInstance("pollScanABI", req.query.address, req.query.network);
    instance.methods
      .getName()
      .call()
      .then(result => {
        res.status(200).json({ message: "Success", data: { name: web3.utils.hexToAscii(result).replace(/\0/g, "") } });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/polltype", async (req, res, next) => {
  if ("address" in req.query && "network" in req.query) {
    const web3 = web3Read(req.query.network);
    const instance = await contractInstance("pollScanABI", req.query.address, req.query.network);
    instance.methods
      .getPollType()
      .call()
      .then(result => {
        res.status(200).json({ message: "Success", data: { polltype: web3.utils.hexToAscii(result).replace(/\0/g, "") } });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/events", async (req, res, next) => {
  if ("address" in req.query && "network" in req.query) {
    const web3 = web3Read(req.query.network);
    const instance = await contractInstance("pollScanABI", req.query.address, req.query.network);
    const startBlockNumber = req.query.network === "main" ? "6500000" : "3000000";
    instance
      .getPastEvents("allEvents", { filter: {}, fromBlock: startBlockNumber, toBlock: "latest" })
      .then(async logs => {
        if (logs.length > 0) {
          let firstBlockDetails = await web3.eth.getBlock(logs[0]["blockNumber"]);
          let lastBlockDetails = await web3.eth.getBlock(logs[logs.length - 1]["blockNumber"]);
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
          res.send({ message: "Success", data: { events: activitiesArray } });
        } else {
          res.json({ message: "Failed", reason: "No logs available at the moment." });
        }
      })
      .catch(err => {
        console.log("printing error: ", err);
        return res.status(500).json({ message: "Failed", reason: err.message });
      });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/starttime", async (req, res, next) => {
  if ("address" in req.query && "network" in req.query) {
    const instance = await contractInstance("pollScanABI", req.query.address, req.query.network);
    instance.methods
      .getStartTime()
      .call()
      .then(result => {
        res.json({ message: "Success", data: { starttime: result } });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/endtime", async (req, res, next) => {
  if ("address" in req.query && "network" in req.query) {
    const instance = await contractInstance("pollScanABI", req.query.address, req.query.network);
    instance.methods
      .getEndTime()
      .call()
      .then(result => {
        res.json({ message: "Success", data: { endtime: result } });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/totalvotes", async (req, res, next) => {
  if ("address" in req.query && "network" in req.query) {
    const instance = await contractInstance("pollScanABI", req.query.address, req.query.network);
    instance.methods
      .getVoterBaseDenominator()
      .call()
      .then(result => {
        res.json({ message: "Success", data: { totalvotes: result } });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/voterbaselogic", async (req, res, next) => {
  if ("address" in req.query && "network" in req.query) {
    const web3 = web3Read(req.query.network);
    const instance = await contractInstance("pollScanABI", req.query.address, req.query.network);
    instance.methods
      .getVoterBaseLogic()
      .call()
      .then(result => {
        res.json({ message: "Success", data: { voterbaselogic: web3.utils.hexToAscii(result).replace(/\0/g, "") } });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/votetallies", async (req, res, next) => {
  if ("address" in req.query && "network" in req.query) {
    const instance = await contractInstance("pollScanABI", req.query.address, req.query.network);
    instance.methods
      .getVoteTallies()
      .call()
      .then(result => {
        res.json({ message: "Success", data: { votetallies: result } });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/proposalswithvotes", async (req, res, next) => {
  if ("address" in req.query && "network" in req.query) {
    const web3 = web3Read(req.query.network);
    const instance = await contractInstance("pollScanABI", req.query.address, req.query.network);
    const promiseArray = [];
    const proposalsPromise = instance.methods.getProposals().call();
    promiseArray.push(proposalsPromise);
    const voterCountsPromise = instance.methods.getVoterCounts().call();
    promiseArray.push(voterCountsPromise);
    Promise.all(promiseArray)
      .then(result => {
        const proposalsWithVotes = [];
        const proposals = result[0];
        const voterCounts = result[1];
        let totalVotesCasted = 0;
        for (const key in proposals) {
          if (proposals.hasOwnProperty(key)) {
            proposalsWithVotes.push({
              name: web3.utils
                .hexToAscii(proposals[key])
                .split(web3.utils.hexToAscii("0x00"))
                .join(""),
              votes: voterCounts[key]
            });
            totalVotesCasted += parseInt(result[key]);
          }
        }
        res.json({
          message: "Success",
          data: {
            proposalswithvotes: proposalsWithVotes,
            totalvotescasted: totalVotesCasted
          }
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

module.exports = router;
