var express = require('express');
var fs = require('fs');
var router = express.Router();

const pollscan_abi = JSON.parse(fs.readFileSync("./ABIs/pollScanABI.json"));
const entity_abi = JSON.parse(fs.readFileSync("./ABIs/entityABI.json"));
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/identify', async function (req, res, next) {
  var notPoll = false
  var notEntity = false
  if ("address" in req.query) {
    try {
      var code = await web3.eth.getCode(req.query.address)
      if (code === "0x" || code === "0x0"){
        res.send({
          message: "Success",
          data: "eoa"
        })
      }else{
          var pollInstance = new web3.eth.Contract(pollscan_abi, req.query.address);
          pollInstance.methods.getPollType().call(function (err, result) {
            if (err) {
                console.error(err);
                // res.status(500).json({ message: "Failed", reason: err });
                notPoll = true
            }else{
              res.json({ message: "Success", data: "poll" });
              return 
            }
            
        });
        var entityInstance = new web3.eth.Contract(entity_abi, req.query.address);
        entityInstance.methods.supportsInterface("0x01ffc9a7").call(function (err, result) {
          if (err) {
              console.error(err);
              notEntity = true
          }else{
            res.json({ message: "Success", data: "entity" });
            return
          }          
      });
      }
    } catch (err) {
      console.log(err)
      res
      .status(400)
      .json({
        message: "Failed",
        reason: err.message
      });
    }

  } else {
    res
      .status(500)
      .json({
        message: "Failed",
        reason: "Contract Address is missing in the query"
      });
  }
});

module.exports = router;
