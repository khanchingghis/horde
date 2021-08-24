const fs = require('fs')
const psql = require('./psql')
Tail = require('tail').Tail;
let currentGameId = 'test'

async function setCurrentGameID(gameid){
    currentGameId = gameid
}


const remoteLogPath = '/home/steam/pavlovserver/Pavlov/Saved/Logs/Pavlov.log'

async function watchLog() {
    

    tail = new Tail(remoteLogPath);

    let jsonObj = {}
    let collectionArr = []
    let isCollecting = false
    const initJSONRegex = /\]StatManagerLog: {/
    const endJSONRegex = /^}/
    const overShotRegex = /\[[0-9]{4}\./

    tail.on("line", function (data) {

        // console.log(data)

        if (isCollecting) {
            if (endJSONRegex.test(data) || overShotRegex.test(data)) {
                //end collection
                if (endJSONRegex.test(data)) collectionArr.push('}')
                isCollecting = false
                const jsonStr = collectionArr.join('')
                try {
                    //handle object
                    jsonObj = JSON.parse(jsonStr)
                    jsonObj.gameid = currentGameId
                    console.log(jsonObj)
                    handleObjectSend(jsonObj)
                     //clear collection
                     collectionArr = []
                } catch (e) {
                    console.log(e,jsonStr)
                }
            } else {
                //keep collecting
                collectionArr.push(data)
            }
        }

        if (initJSONRegex.test(data)) {
            //start collection
            collectionArr.push('{')
            isCollecting = true
        }



    });

    tail.on("error", function (error) {
        console.log('ERROR: ', error);
    });

}

async function handleObjectSend(obj){
    const keys = Object.keys(obj)
    console.log(keys[0])
    const {Killer, Killed, KilledBy, Headshot} = obj.KillData
    const sendRes = await psql.writeKillData(currentGameId,Killer, Killed, KilledBy, Headshot)
    return sendRes
}

module.exports = {handleObjectSend, watchLog, setCurrentGameID, currentGameId}