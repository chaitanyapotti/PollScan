var express = require('express');
var router = express.Router();
// var votingContractAddress = '0xce7ab7093a056598c53b5d87082c7019eb2275db'

/* Poll specific qeries. */
router.get('/name', function (req, res, next) {
    if ('address' in req.query) {
        var votingContractAddress = req.query['address']
        if (votingContractAddress in global.contractInstances) {
            var contractInstance = global.contractInstances[votingContractAddress]
        } else {
            var contractInstance = new web3.eth.Contract(abi, votingContractAddress)
            global.contractInstances[votingContractAddress] = contractInstance
        }
        contractInstance.methods.getName().call(function (err, result) {
            if (err) { console.error(err); res.status(500).json({ 'message': 'Failed', 'reason': err }) };
            res.json({ message: 'Success', data: { name: result } })
        })
        /* async await method*/
        // let all_poll_data = async () => {
        //     const name = await contractInstance.methods.getName().call();
        //     const poll_type = await contractInstance.methods.getPollType().call();

        //     console.log(name, poll_type)
        //     res.json({name: name, poll_type: poll_type})
        // }
        // all_poll_data()

        /* sequencial polling*/
        // contractInstance.methods.getName().call(function (err, result) {
        //     if (err) { console.error(err); res.status(500).json({ 'message': 'data not available.' }) };
        //     contractInstance.methods.getPollType().call(function (err, result) {
        //         if (err) { console.error(err); res.status(500).json({ 'message': 'data not available.' }) };
        //         res.send({name: this.name, poll_type: result})
        //     }.bind({'name': result}))


    } else {
        res.status(500).json({ 'message': 'Failed', 'reason': 'Contract Address is missing in the query' })
    }
    // contractInstance.methods.getName().call(function (err, result) {
    //     if (err) { console.error(err); res.status(500).json({ 'message': 'data not available.' }) };
    //     res.send(result)
    // })
});

router.get('/polltype', function (req, res, next) {
    if ('address' in req.query) {
        var votingContractAddress = req.query['address']
        if (votingContractAddress in global.contractInstances) {
            var contractInstance = global.contractInstances[votingContractAddress]
        } else {
            var contractInstance = new web3.eth.Contract(abi, votingContractAddress)
            global.contractInstances[votingContractAddress] = contractInstance
        }
        contractInstance.methods.getPollType().call(function (err, result) {
            if (err) { console.error(err); res.status(500).json({ 'message': 'Failed', 'reason': err }) };
            res.json({ message: 'Success', data: { polltype: result } })
        })
    } else {
        res.status(500).json({ 'message': 'Failed', 'reason': 'Contract Address is missing in the query' })
    }
});

router.get('/events', function (req, res, next) {
    if ('address' in req.query) {
        var votingContractAddress = req.query['address']
        if (votingContractAddress in global.contractInstances) {
            var contractInstance = global.contractInstances[votingContractAddress]
        } else {
            var contractInstance = new web3.eth.Contract(abi, votingContractAddress)
            global.contractInstances[votingContractAddress] = contractInstance
        }
        contractInstance.getPastEvents({ fromBlock: 0, toBlock: 'latest' },
            function (err, logs) {
                if (err) { 
                    console.log(err)
                    res.status(500).json({ 'message': 'Failed', 'reason': err })
                }
                console.log('logs: ', logs)
                if (logs.length>0) {
                    getFirstAndLastBlockTimeStamp = async () => {
                        let firstBlockDetails = await web3.eth.getBlock(logs[0]['blockNumber'])
                        let lastBlockDetails = await web3.eth.getBlock(logs[logs.length - 1]['blockNumber'])
                        // console.log(firstBlockDetails, lastBlockDetails)
                        let activitiesArray = []
                        let m; let b;
                        if (firstBlockDetails.number=== lastBlockDetails.number){   
                            m = 0 
                            b = lastBlockDetails.timestamp
                        }else{
                            m = (lastBlockDetails.timestamp - firstBlockDetails.timestamp)/(firstBlockDetails.number- lastBlockDetails.number)
                            b = lastBlockDetails.timestamp - m*lastBlockDetails.number
                        }
            
                        for (let log of logs ){
                            activitiesArray.push({type: log.event, weight: log.returnValues.voteWeight, 
                                value:log.returnValues._to, address: log.returnValues._from, datetime: parseInt(m*log.blockNumber+b) })
                        }
                        // blocktimes: { firstblockno: firstBlockDetails.number, firstblocktime: firstBlockDetails.timestamp, lastblockno: lastBlockDetails.number, lastblocktime: lastBlockDetails.timestamp }
                        res.send({ message: 'Success', data: { events: activitiesArray } })
                    }
                    getFirstAndLastBlockTimeStamp()

                    // for (let log of logs){
                    //     console.log(log)
                    //     web3.eth.getBlock(log['blockNumber'], function(err, data){
                    //         console.log(data)
                    //     })
                    // }
                }else{
                    res.json({ 'message': 'Failed', 'reason': 'No logs available at the moment.' })
                }
            })

        // contractInstance.methods.getPollType().call(function (err, result) {
        //     if (err) { console.error(err); res.status(500).json({ 'message': 'Failed', 'reason': err }) };
        //     res.json({ message: 'Success', data: { polltype: result } })
        // })
    } else {
        res.status(500).json({ 'message': 'Failed', 'reason': 'Contract Address is missing in the query' })
    }
});

router.get('/starttime', function (req, res, next) {
    if ('address' in req.query) {
        var votingContractAddress = req.query['address']
        if (votingContractAddress in global.contractInstances) {
            var contractInstance = global.contractInstances[votingContractAddress]
        } else {
            var contractInstance = new web3.eth.Contract(abi, votingContractAddress)
            global.contractInstances[votingContractAddress] = contractInstance
        }
        contractInstance.methods.getStartTime().call(function (err, result) {
            if (err) { console.error(err); res.status(500).json({ 'message': 'Failed', 'reason': err }) };
            res.json({ message: 'Success', data: { starttime: result } })
        })
    } else {
        res.status(500).json({ 'message': 'Failed', 'reason': 'Contract Address is missing in the query' })
    }
});

router.get('/voterbaselogic', function (req, res, next) {
    if ('address' in req.query) {
        var votingContractAddress = req.query['address']
        if (votingContractAddress in global.contractInstances) {
            var contractInstance = global.contractInstances[votingContractAddress]
        } else {
            var contractInstance = new web3.eth.Contract(abi, votingContractAddress)
            global.contractInstances[votingContractAddress] = contractInstance
        }
        contractInstance.methods.getVoterBaseLogic().call(function (err, result) {
            if (err) { console.error(err); res.status(500).json({ 'message': 'Failed', 'reason': err }) };
            res.json({ message: 'Success', data: { voterbaselogic: result } })
        })
    } else {
        res.status(500).json({ 'message': 'Failed', 'reason': 'Contract Address is missing in the query' })
    }
});

router.get('/votetallies', function (req, res, next) {
    if ('address' in req.query) {
        var votingContractAddress = req.query['address']
        if (votingContractAddress in global.contractInstances) {
            var contractInstance = global.contractInstances[votingContractAddress]
        } else {
            var contractInstance = new web3.eth.Contract(abi, votingContractAddress)
            global.contractInstances[votingContractAddress] = contractInstance
        }
        contractInstance.methods.getVoteTallies().call(function (err, result) {
            if (err) { console.error(err); res.status(500).json({ 'message': 'Failed', 'reason': err }) };
            res.json({ message: 'Success', data: { votetallies: result } })
        })
    } else {
        res.status(500).json({ 'message': 'Failed', 'reason': 'Contract Address is missing in the query' })
    }
});

router.get('/proposalswithvotes', function (req, res, next) {
    if ('address' in req.query) {
        var votingContractAddress = req.query['address']
        if (votingContractAddress in global.contractInstances) {
            var contractInstance = global.contractInstances[votingContractAddress]
        } else {
            var contractInstance = new web3.eth.Contract(abi, votingContractAddress)
            global.contractInstances[votingContractAddress] = contractInstance
        }
        contractInstance.methods.getProposals().call(function (err, result) {
            if (err) { console.error(err); res.status(500).json({ 'message': 'Failed', 'reason': err }) };
            if (result) {
                contractInstance.methods.getVoterCounts().call(function (err, result) {
                    if (err) { console.error(err); res.status(500).json({ 'message': 'Failed', 'reason': err }) };
                    if (result) {
                        var proposalsWithVotes = []
                        var totalVotesCasted = 0
                        for (proposal in this.proposals) {
                            let proposalName = web3.utils.hexToAscii(this.proposals[proposal]).split(web3.utils.hexToAscii('0x00')).join('')
                            if (proposalName.length > 0) {
                                proposalsWithVotes.push({ name: proposalName, votes: result[proposal], percent: 10 })
                                totalVotesCasted += parseInt(result[proposal])
                            }
                        }
                        res.json({ message: 'Success', data: { proposalswithvotes: proposalsWithVotes, totalvotescasted: totalVotesCasted } })
                    }
                }.bind({ 'proposals': result }))
            }
        })
    } else {
        res.status(500).json({ 'message': 'Failed', 'reason': 'Contract Address is missing in the query' })
    }
});


module.exports = router;
