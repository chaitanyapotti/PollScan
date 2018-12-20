var express = require("express");
var router = express.Router();
var fs = require("fs");

const Multer = require("multer");
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

const pollscan_abi = JSON.parse(fs.readFileSync("./ABIs/pollScanABI.json"));
const entity_abi = JSON.parse(fs.readFileSync("./ABIs/entityABI.json"));

// const HDWalletProvider = require("truffle-hdwallet-provider");
// const Web3 = require('web3');
// const testnet = `https://rinkeby.infura.io/v3/894765ed26c2470587b00e37249612e4`
// const testnet = 'http://localhost:8545'

// const provider = new HDWalletProvider(
//     // "blue inherit drum enroll amused please camp false estate flash sell right", //potti's
//     // process.env.ACCOUNT_WORDS,
//       "rookie cross around replace trim garden before ancient manage arena bar rigid",
//     testnet
// );

// web3 = new Web3(provider);

//http://localhost:2018/eoa/check/membership?useraddress=0xb758c38326Df3D75F1cf0DA14Bb8220Ca4231e74&entityaddress=0x7a3E2f3A866d9fa9621c6807d9af12Dd9124aFE6
router.get("/check/membership", function(req, res, next) {
  if ("useraddress" in req.query && "entityaddress" in req.query) {
    var entityAddress = req.query["entityaddress"];
    var userAddress = req.query["useraddress"];
    if (entityAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[entityAddress];
    } else {
      var contractInstance = new web3.eth.Contract(entity_abi, entityAddress);
      global.contractInstances[entityAddress] = contractInstance;
    }
    contractInstance.methods.isCurrentMember(userAddress).call(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Failed", reason: err });
      }
      res.json({ message: "Success", data: result });
    });
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.get("/poll/activity", async function(req, res, next) {
  if ("useraddress" in req.query && "polladdress" in req.query) {
    var pollAddress = req.query["polladdress"];
    var userAddress = req.query["useraddress"];
    if (pollAddress in global.contractInstances) {
      var contractInstance = global.contractInstances[pollAddress];
    } else {
      var contractInstance = new web3.eth.Contract(pollscan_abi, pollAddress);
      global.contractInstances[pollAddress] = contractInstance;
    }
    try {
      var proposalNamesEncoded = await contractInstance.methods.getProposals().call();
      var castVoteLogs = await contractInstance.getPastEvents("CastVote", { filter: { _from: userAddress }, fromBlock: 0, toBlock: "latest" });
      var revokedVoteLogs = await contractInstance.getPastEvents("RevokedVote", { filter: { _from: userAddress }, fromBlock: 0, toBlock: "latest" });
      // console.log(proposalNamesEncoded)
      // console.log(castVoteLogs)
      // console.log(revokedVoteLogs)
      var proposalNames = [];
      for (proposal of proposalNamesEncoded) {
        let temp = web3.utils.toAscii(proposal).replace(/\0/g, "");
        if (temp.length > 0) {
          proposalNames.push(temp);
        }
      }

      // console.log(proposalNames)
      var voteEvents = castVoteLogs.concat(revokedVoteLogs);
      var finalVoteLog = [];
      if (voteEvents.length > 0) {
        let firstBlockDetails = await web3.eth.getBlock(voteEvents[0]["blockNumber"]);
        let lastBlockDetails = await web3.eth.getBlock(voteEvents[voteEvents.length - 1]["blockNumber"]);
        let m;
        let b;
        if (firstBlockDetails.number === lastBlockDetails.number) {
          m = 0;
          b = lastBlockDetails.timestamp;
        } else {
          m = -(lastBlockDetails.timestamp - firstBlockDetails.timestamp) / (firstBlockDetails.number - lastBlockDetails.number);
          b = lastBlockDetails.timestamp - m * lastBlockDetails.number;
        }
        for (voteEvent of voteEvents) {
          console.log(voteEvent);
          let returnValues = voteEvent["returnValues"];
          finalVoteLog.push({
            event: voteEvent.event,
            proposal: proposalNames[returnValues._to],
            timeStamp: parseInt(m * voteEvent.blockNumber + b)
          });
        }
        res.send({ message: "Success", data: finalVoteLog });
      } else {
        res.send({ message: "Success", data: [] });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed",
        reason: "Contract Address is missing in the query"
      });
    }
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

router.post("/check/vbsmembership", multer.single("file"), async function(req, res, next) {
  if (!req.file || !req.query.useraddress) {
    res.status(400).send("No file uploaded.");
    return;
  }
  var userAddress = req.query["useraddress"];
  fileData = JSON.parse(req.file.buffer.toString("utf-8"));

  let attributesData = {};
  let attributeDataHeaderKeys = {};
  let attributeHeaders = [];
  let userAttributes = [];

  for (object_to_resolve of fileData["to_resolve"]) {
    console.log(object_to_resolve);
    if (object_to_resolve["key"].indexOf("$") === -1) {
      attributesData = {};
      attributeDataHeaderKeys = {};
      attributeHeaders = [];
      userAttributes = [];
      var entityAddress = object_to_resolve["address"];
      if (entityAddress in global.contractInstances) {
        var contractInstance = global.contractInstances[entityAddress];
      } else {
        var contractInstance = new web3.eth.Contract(entity_abi, entityAddress);
        global.contractInstances[entityAddress] = contractInstance;
      }

      try {
        let attributeNames = await contractInstance.methods.getAttributeNames().call();
        // console.log(attributeNames)

        for (let i in attributeNames) {
          let attributeOptions = await contractInstance.methods.getAttributeCollection(attributeNames[i]).call();
          let temp = [];
          for (let j in attributeOptions) {
            temp.push(web3.utils.toAscii(attributeOptions[j]).replace(/\0/g, ""));
          }
          attributesData[i] = temp;
          attributeDataHeaderKeys[web3.utils.toAscii(attributeNames[i]).replace(/\0/g, "")] = temp;
          attributeHeaders.push(web3.utils.toAscii(attributeNames[i]).replace(/\0/g, ""));
        }

        var result = await contractInstance.methods.isCurrentMember(userAddress).call();

        eval("var " + object_to_resolve["key"] + "_flag = " + result.toString());
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        if (userAttributes.length === 0) {
          var entityAddress = object_to_resolve["address"];
          if (entityAddress in global.contractInstances) {
            var contractInstance = global.contractInstances[entityAddress];
          } else {
            var contractInstance = new web3.eth.Contract(entity_abi, entityAddress);
            global.contractInstances[entityAddress] = contractInstance;
          }

          var userAttributesEncoded = await contractInstance.methods.getAttributes(userAddress).call();
          userAttributes = [];
          for (userAttribute of userAttributesEncoded) {
            let temp = web3.utils.toAscii(userAttribute).replace(/\0/g, "");
            if (temp.length > 0) {
              userAttributes.push(temp);
            }
          }
        }
        console.log("logging: ", attributesData, attributeHeaders);
        console.log(userAttributes);
      } catch (err) {
        console.log(err);
      }
      eval("var " + object_to_resolve["key"] + "_flag = " + true.toString());
    }
  }

  res.send({ message: "Success", data: eval(fileData["equation"]) });

  res.send(fileData);
});

module.exports = router;
