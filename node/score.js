const fs = require('fs')
const axios = require('axios')
const thisPath = __dirname
const serverFileName = 'serverOptions.json'
const serverPath = thisPath + `/${serverFileName}`
const readline = require("readline");
const rcon = require('./rcon')
const servers = require('./servers')
const { v4: uuidv4 } = require('uuid');

const myFormID = '1FAIpQLScOi8_7neH_71KM1AuS2PL2ZIs794eNv1u4ZunEz8WFuXwyBg'

let iteration = 0
const spinRateMS = 2000
const cycleRateMS = 3000
const logCyleInt = 2
const logActiveCycleInt = 2

let latestKDAs = {
    "MapLabel":"",
    "GameMode":""
}
let thisGameId = uuidv4()

function getServerFile(callback) {

    try {
        if (fs.existsSync(serverPath)) {
            const server = require(serverPath)
            callback(server)
        } else {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.on("close", function () {
                console.log(`Server Details Saved to ${serverPath}`);
                const server = require(serverPath)
                callback(server)
            });

            console.log('No serverInfo.json found. Creating...')

            rl.question("Port ? ", function (port) {
                rl.question("Password ? ", function (password) {
                    const serverDetails = {
                        "ip": "localhost",
                        "port": port,
                        "password": password
                    }
                    fs.writeFileSync(serverPath, JSON.stringify(serverDetails))
                    rl.close();
                });

            });

        }

    } catch (err) {
        console.error(err)
    }
}

async function postScores(activeSocket, server) {

    //local first, then http
    const thisServer = await rcon.getServerInfo(activeSocket)
    if (!thisServer) return null

    let playerList = thisServer.playerList
    let serverInfo = thisServer.serverInfo.ServerInfo

    const timeNow = new Date()
    const timeStamp = timeNow.toISOString()


    if (iteration == 1) {
        const fullServerDetails = await servers.getFullServerInfo(activeSocket, server)
        serverInfo = fullServerDetails.serverInfo.ServerInfo
        latestKDAs.latestMapLabel = serverInfo.mapLabel
        latestKDAs.latestMapID = serverInfo.MapLabel
    }

    if (playerList.length > 0) {
        //console.log(JSON.stringify(playerList))
        const allKDASum = sumAllKDA(playerList)

        if ((allKDASum == 0 && allKDASum != latestKDAs.allKDASum) || (serverInfo && serverInfo.MapLabel != latestKDAs.latestMapID)) {
            thisGameId = uuidv4()
            latestKDAs.allKDASum = allKDASum
            latestKDAs.latestMapID = serverInfo.MapLabel
            latestKDAs.isNewRound = true
        }

            const res = await gFormPost(myFormID, playerList, serverInfo, server, activeSocket)


    } else {
        if (iteration % logCyleInt == 0) {
            console.log(timeStamp, 'no players...')
            // console.log(timeStamp, 'Round', serverInfo.RoundState)
        }
    }
}

function sumKDA(player){
    if (player.PlayerInfo) {
        return player.PlayerInfo.KDA.split('/').reduce((a, b) => a + parseInt(b), 0)
    } else {
        return 0
    }
}

function sumAllKDA(playerList) {
    let allKDASum = sumKDA(playerList[0])
    if (playerList.length > 1) {
        allKDASum = playerList.reduce((a, b) => a + sumKDA(b),0)
    }
    return allKDASum
}

async function gFormPost(formID, playerList, serverInfo, serverCon, activeSocket) {
    const formUrl = `https://docs.google.com/forms/u/0/d/e/${formID}/formResponse`
    const timeNow = new Date()
    const timeStamp = timeNow.toISOString()

    for (i = 0; i < playerList.length; i++) {
        const playerInfo = playerList[i].PlayerInfo
        const kda = playerInfo.KDA.split('/')
        const kdaSum = kda.reduce((a, b) => a + b, 0)
        const playerID = playerInfo.UniqueId
        const nameIntRegex = /<[0-9]. /g
        const playerName = playerInfo.PlayerName.replace(nameIntRegex,"")
        const playerCountInt = serverInfo.PlayerCount.split('/')[0]
        const thisServerName = serverInfo.ServerName

        if (!latestKDAs.isNewRound && latestKDAs[playerID] && latestKDAs[playerID] == kdaSum) {
            //No log
            // if (iteration % logActiveCycleInt == 0) {
            //     console.log(timeStamp, 'No KDA change. Skipping post...')
            // }
        } else {
            latestKDAs[playerID] = kdaSum

            if (latestKDAs.isNewRound || latestKDAs.MapLabel.trim() == '' || latestKDAs.GameMode.trim() == '') {
                console.log(timeStamp, 'New round!')
                latestKDAs.isNewRound = false
                const fullServerDetails = await servers.getFullServerInfo(activeSocket)
                latestKDAs.MapLabel = fullServerDetails.serverInfo.ServerInfo.mapLabel
                latestKDAs.GameMode = fullServerDetails.serverInfo.ServerInfo.gameMode
            }

            const sendObj = {
                "entry.748779749": playerName,
                "entry.1044143160": playerID,
                "entry.1011362435": playerInfo.TeamId,
                "entry.1974831837": latestKDAs.MapLabel,
                "entry.530914442": kda[0],
                "entry.1923937347": kda[1],
                "entry.1339739528": kda[2],
                "entry.1078658169": thisServerName,
                "entry.742200735": latestKDAs.GameMode,
                "entry.686146210": playerCountInt,
                "entry.1863816147": thisGameId
            }

            axios.get(formUrl, {
                params: sendObj
            })
            .then(x => console.log(timeStamp, `Updated ${playerName} whose score is now ${kda[2]}`))


        }
    }
}

function init() {
    getServerFile((server) => {
        // console.log(JSON.stringify(server))
        rcon.spinServer(server, spinRateMS).then(activeSocket => {
            setInterval(() => {
                postScores(activeSocket, server)
                iteration++
            }, cycleRateMS)
        })
        
    })
}

init()
