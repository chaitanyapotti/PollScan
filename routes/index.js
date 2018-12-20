const express = require("express");
const router = express.Router();
const contractInstance = require("../utils/contractInstance");
const web3Read = require("../utils/web3Read");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.status(200).send({ title: "Welcome to PollScan backend." });
});

router.get("/identify", async (req, res, next) => {
  let notPoll = false;
  let notEntity = false;
  if ("address" in req.query && "network" in req.query) {
    try {
      const web3 = web3Read(req.query.network);
      const code = await web3.eth.getCode(req.query.address);
      if (code === "0x" || code === "0x0") {
        res.send({
          message: "Success",
          data: "eoa"
        });
      } else {
        const pollInstance = await contractInstance("pollScanABI", req.query.address, req.query.network);
        pollInstance.methods
          .getPollType()
          .call()
          .then(result => {
            return res.json({ message: "Success", data: "poll" });
          })
          .catch(err => {
            notPoll = true;
          });
        const entityInstance = await contractInstance("entityABI", req.query.address, req.query.network);
        entityInstance.methods
          .supportsInterface("0x01ffc9a7")
          .call()
          .then(result => {
            if (result) return res.json({ message: "Success", data: "entity" });
            else
              res.status(400).json({
                message: "Failed",
                reason: "Not an Entity"
              });
          })
          .catch(err => {
            console.error(err);
            notEntity = true;
          });
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({
        message: "Failed",
        reason: err.message
      });
    }
  } else {
    res.status(500).json({
      message: "Failed",
      reason: "Contract Address is missing in the query"
    });
  }
});

module.exports = router;
