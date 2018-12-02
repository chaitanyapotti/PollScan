var express = require("express");
var router = express.Router();
var fs = require('fs');

const entity_abi = JSON.parse(fs.readFileSync("./ABIs/entityABI.json"));

//http://localhost:2018/entity/events?address=0x7a3E2f3A866d9fa9621c6807d9af12Dd9124aFE6
router.get("/events", function (req, res, next) {
    if ("address" in req.query) {
        var entityContractAddress = req.query["address"];
        if (entityContractAddress in global.contractInstances) {
            var contractInstance = global.contractInstances[entityContractAddress];
        } else {
            var contractInstance = new web3.eth.Contract(entity_abi, entityContractAddress);
            global.contractInstances[entityContractAddress] = contractInstance;
        }
        contractInstance.getPastEvents({ fromBlock: 0, toBlock: 'latest' },
            function (err, logs) {
                if (err) {
                    console.log("printing error: ", err)
                    res.status(500).json({ 'message': 'Failed', 'reason': err.message })
                    return
                }
                let addressData = {}
                let attributesData = {}
                let attributeDataHeaderKeys = {}
                let attributeHeaders = []
                // console.log('logs: ', logs)
                if (logs.length > 0) {
                    getFirstAndLastBlockTimeStamp = async () => {
                        try{

                        let firstBlockDetails = await web3.eth.getBlock(logs[0]['blockNumber'])
                        let lastBlockDetails = await web3.eth.getBlock(logs[logs.length - 1]['blockNumber'])

                        let attributeNames = await contractInstance.methods.getAttributeNames().call()
                        // console.log(attributeNames)

                        for (let i in attributeNames) {
                            let attributeOptions = await contractInstance.methods.getAttributeCollection(attributeNames[i]).call()
                            let temp = []
                            for (let j in attributeOptions) {
                                temp.push(web3.utils.toAscii(attributeOptions[j]).replace(/\0/g, ''))
                            }
                            attributesData[i] = temp
                            attributeDataHeaderKeys[web3.utils.toAscii(attributeNames[i]).replace(/\0/g, '')] = temp
                            attributeHeaders.push(web3.utils.toAscii(attributeNames[i]).replace(/\0/g, ''))
                        }

                        console.log(attributesData, attributeHeaders, attributeDataHeaderKeys)

                        // console.log(firstBlockDetails, lastBlockDetails)
                        let activitiesArray = []
                        let m; let b;
                        if (firstBlockDetails.number === lastBlockDetails.number) {
                            m = 0
                            b = lastBlockDetails.timestamp
                        } else {
                            m = -(lastBlockDetails.timestamp - firstBlockDetails.timestamp) / (firstBlockDetails.number - lastBlockDetails.number)
                            b = lastBlockDetails.timestamp - m * lastBlockDetails.number
                        }

                        for (let log of logs) {
                            // console.log("printing event type: ", log)
                            if (log["event"]) {
                                switch (log["event"]) {
                                    case "Assigned": {
                                        let result = log["returnValues"]
                                        addressData[result._to] = {
                                            "address": result._to
                                        }
                                        let attributes = {}
                                        addressData[result._to]["timeStamp"] = parseInt(m * log.blockNumber + b)
                                        addressData[result._to]["type"] = "Assigned"
                                        for (let i in result.attributeIndexes) {
                                            // addressData[result._to][attributeHeaders[i]] = attributesData[i][result.attributeIndexes[i]]
                                            // addressData[result._to][attributeHeaders[i]+ "_previous"] = attributesData[i][result.attributeIndexes[i]]
                                            attributes[attributeHeaders [i]] = attributesData[i][result.attributeIndexes[i]]
                                            attributes[attributeHeaders[i]+ "_previous"] = attributesData[i][result.attributeIndexes[i]]
                                            addressData[result._to][attributeHeaders [i]] = attributesData[i][result.attributeIndexes[i]]
                                        }
                                        addressData[result._to]["revoked"] = false
                                        
                                        addressData[result._to]["attributes"] = attributes
                                        
                                        activitiesArray.push({
                                            address: result._to,
                                            timeStamp: parseInt(m * log.blockNumber + b),
                                            type: "Assigned",
                                            attributes: attributes
                                        })
                                        break;
                                    }
                                    case "Revoked": {
                                        let result = log["returnValues"]
                                        // console.log("before error: ", result, result["_to"])
                                        // if (!(result["_to"] in addressData)){
                                        //     addressData[result._to] = {}     
                                        // }
                                        addressData[result._to]["revoked"] = true
                                        activitiesArray.push({
                                            address: result._to,
                                            timeStamp: parseInt(m * log.blockNumber + b),
                                            type: "Revoked",
                                            attributes: addressData[result._to]
                                        })
                                        break;
                                    }
                                    case "ModifiedAttributes": {
                                        let result = log["returnValues"]
                                        addressData[result._to][web3.utils.toAscii(result.attributeName).replace(/\0/g, '')] = attributeDataHeaderKeys[web3.utils.toAscii(result.attributeName).replace(/\0/g, '')][result.attributeIndex]
                                        activitiesArray.push({
                                            address: result._to,
                                            timeStamp: parseInt(m * log.blockNumber + b),
                                            type: "ModifiedAttributes",
                                            attributes: addressData[result._to]
                                        })
                                        break;
                                    }
                                    case "RequestedMembership": {
                                        // let result = log["returnValues"]
                                        break;
                                    }
                                    case "ApprovedMembership": {
                                        let result = log["returnValues"]
                                        activitiesArray.push({
                                            address: result._to,
                                            timeStamp: parseInt(m * log.blockNumber + b),
                                            type: "ApprovedMembership",
                                            attributes: {}
                                        })
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            }
                            // activitiesArray.push({
                            //     type: log.event, returnValues: log.returnValues.result,
                            //     value: log.returnValues._to, address: log.returnValues._from, datetime: parseInt(m * log.blockNumber + b)
                            // })
                        }
                        // console.log(addressData)
                        // console.log(activitiesArray)
                        let memberList = []
                        for (let address in addressData){
                            let temp = addressData[address]
                            temp["address"]  = address
                            delete temp["attributes"] 
                            if (!temp.revoked){
                                memberList.push(temp)
                            }
                            
                        }
                        // blocktimes: { firstblockno: firstBlockDetails.number, firstblocktime: firstBlockDetails.timestamp, lastblockno: lastBlockDetails.number, lastblocktime: lastBlockDetails.timestamp }
                        res.send({ message: 'Success', data: { allActivities: activitiesArray, memberList: memberList, attributeHeaders:attributeHeaders, attributeDetails: attributeDataHeaderKeys } })
                    }catch(err){
                        console.log(err)
                        res.json({ 'message': 'Failed', 'reason': 'No logs available at the moment.' })
                    }
                }
                    getFirstAndLastBlockTimeStamp()
                } else {
                    res.json({ 'message': 'Failed', 'reason': 'No logs available at the moment.' })
                }
            })
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