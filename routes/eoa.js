var express = require("express");
var router = express.Router();
const contractInstance = require("../utils/contractInstance");
const web3Read = require("../utils/web3Read");

const Multer = require("multer");
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

//http://localhost:2018/eoa/check/membership?useraddress=0xb758c38326Df3D75F1cf0DA14Bb8220Ca4231e74&entityaddress=0x7a3E2f3A866d9fa9621c6807d9af12Dd9124aFE6
router.get("/check/membership", async (req, res, next) => {
  if ("useraddress" in req.query && "entityaddress" in req.query && "network" in req.query) {
    var entityAddress = req.query["entityaddress"];
    var userAddress = req.query["useraddress"];
    const instance = await contractInstance("entityABI", entityAddress, req.query.network);
    instance.methods
      .isCurrentMember(userAddress)
      .call()
      .then(result => {
        res.json({ message: "Success", data: result });
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

//http://localhost:2018/eoa/poll/activity?polladdress=0x95d0fFEa1400584d85ae2533917DB058059D8046&useraddress=0xb71c9385e9af62245045c36DAE452FF5a903F111&network=rinkeby
router.get("/poll/activity", async (req, res, next) => {
  if ("useraddress" in req.query && "polladdress" in req.query && "network" in req.query) {
    const web3 = web3Read(req.query.network);
    var pollAddress = req.query["polladdress"];
    var userAddress = req.query["useraddress"];
    const instance = await contractInstance("pollScanABI", pollAddress, req.query.network);
    try {
      const promiseArray = [];
      const proposalNamesEncodedPromise = instance.methods.getProposals().call();
      promiseArray.push(proposalNamesEncodedPromise);
      const startBlockNumber = req.query.network === "main" ? "6500000" : "3000000";
      const castVotePromise = instance.getPastEvents("CastVote", { filter: { _from: userAddress }, fromBlock: startBlockNumber, toBlock: "latest" });
      promiseArray.push(castVotePromise);
      const revokeVotePromise = instance.getPastEvents("RevokedVote", {
        filter: { _from: userAddress },
        fromBlock: startBlockNumber,
        toBlock: "latest"
      });
      promiseArray.push(revokeVotePromise);
      Promise.all(promiseArray)
        .then(async result => {
          const proposalNamesEncoded = result[0];
          const castVoteLogs = result[1];
          const revokedVoteLogs = result[2];
          console.log(proposalNamesEncoded);
          console.log(castVoteLogs);
          console.log(revokedVoteLogs);
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
        })
        .catch(err => {
          console.log(err);
          res.json({ message: "Failed", reason: "No logs available at the moment." });
        });
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

router.post("/check/vbsmembership", multer.single("file"), async (req, res, next) => {
  if (!req.file || !req.query.useraddress || !req.query.network) {
    res.status(400).send("No file uploaded.");
    return;
  }
  var userAddress = req.query["useraddress"];
  const fileData = JSON.parse(req.file.buffer.toString("utf-8"));
  const web3 = web3Read(req.query.network);

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

      const instance = await contractInstance("entityABI", entityAddress, req.query.network);

      try {
        let attributeNames = await instance.methods.getAttributeNames().call();
        // console.log(attributeNames)

        for (let i in attributeNames) {
          let attributeOptions = await instance.methods.getAttributeCollection(attributeNames[i]).call();
          let temp = [];
          for (let j in attributeOptions) {
            temp.push(web3.utils.toAscii(attributeOptions[j]).replace(/\0/g, ""));
          }
          attributesData[i] = temp;
          attributeDataHeaderKeys[web3.utils.toAscii(attributeNames[i]).replace(/\0/g, "")] = temp;
          attributeHeaders.push(web3.utils.toAscii(attributeNames[i]).replace(/\0/g, ""));
        }

        var result = await instance.methods.isCurrentMember(userAddress).call();

        eval("var " + object_to_resolve["key"] + "_flag = " + result.toString());
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        if (userAttributes.length === 0) {
          var entityAddress = object_to_resolve["address"];
          const instance = await contractInstance("entityABI", entityAddress, req.query.network);

          var userAttributesEncoded = await instance.methods.getAttributes(userAddress).call();
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
