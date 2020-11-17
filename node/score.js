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
let latestKDAs = {}
let iteration = 0
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

function postScores(server) {
    servers.getFullServerInfo(server).then(thisServer => {
        if (!thisServer) return null
        
        const playerList = thisServer.playerList
        const serverInfo = thisServer.serverInfo.ServerInfo
        if (iteration == 1) latestKDAs.latestMap = serverInfo.mapLabel

        const timeNow = new Date()
        const timeStamp = timeNow.toISOString()

        if (playerList.length > 0) {
            const allKDASum = sumAllKDA(playerList)
            if ((allKDASum == 0 && allKDASum != latestKDAs.allKDASum) || serverInfo.mapLabel != latestKDAs.latestMap) {
                thisGameId = uuidv4()
                latestKDAs.allKDASum = allKDASum
            }
            gFormPost(myFormID, playerList, serverInfo)
        } else {
            if (iteration % 2 == 0) {
                console.log(timeStamp, 'no players...')
            }
        }
    })
}

function sumAllKDA(playerList) {
    let allKDASum = playerList[0].PlayerInfo.KDA.split('/').reduce((a, b) => a + b, 0)
    if (playerList.length > 1) {
        allKDASum = playerList.reduce((a, b) => {
            return a.PlayerInfo.KDA.split('/').reduce((a, b) => a + b, 0) + b.PlayerInfo.KDA.split('/').reduce((a, b) => a + b, 0)
        }, 0)
    }
    return allKDASum
}

function gFormPost(formID, playerList, serverInfo) {
    const formUrl = `https://docs.google.com/forms/u/0/d/e/${formID}/formResponse`
    const timeNow = new Date()
    const timeStamp = timeNow.toISOString()

    for (i = 0; i < playerList.length; i++) {
        const playerInfo = playerList[i].PlayerInfo
        const kda = playerInfo.KDA.split('/')
        const kdaSum = kda.reduce((a, b) => a + b, 0)
        const playerID = playerInfo.UniqueId
        const playerName = playerInfo.PlayerName
        const playerCountInt = serverInfo.PlayerCount.split('/')[0]

        if (latestKDAs[playerID] && latestKDAs[playerID] == kdaSum) {
            if (iteration % 5 == 0) {
                console.log(timeStamp, 'No KDA change. Skipping post...')
            }
        } else {
            latestKDAs[playerID] = kdaSum
            const sendObj = {
                "entry.748779749": playerName,
                "entry.1044143160": playerID,
                "entry.1011362435": playerInfo.TeamId,
                "entry.1974831837": serverInfo.mapLabel,
                "entry.530914442": kda[0],
                "entry.1923937347": kda[1],
                "entry.1339739528": kda[2],
                "entry.1078658169": serverInfo.ServerName,
                "entry.742200735": serverInfo.gameMode,
                "entry.686146210": playerCountInt,
                "entry.1863816147": thisGameId
            }

            axios.get(formUrl, {
                params: sendObj
            }).then(x => console.log(timeStamp, `Updated ${playerName} whose score is now ${kda[2]}`))
        }
    }

}

function init() {
    getServerFile((server) => {
        // console.log(JSON.stringify(server))
        setInterval(() => {
            
            postScores(server)
            iteration++
        }, 5000)
    })
}

init()
