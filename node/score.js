const fs = require('fs')
const axios = require('axios')
const thisPath = __dirname
const readline = require("readline");
const rcon = require('./rcon')
const servers = require('./servers')
const { v4: uuidv4 } = require('uuid');
const psql = require('./psql')
const dMsg = require('./bot')

const myFormID = '1FAIpQLScOi8_7neH_71KM1AuS2PL2ZIs794eNv1u4ZunEz8WFuXwyBg'

let iteration = 0
const spinRateMS = 5000
const cycleRateMS = 10000
const logCyleInt = 10
const logActiveCycleInt = 2

let latestKDAs = {
    "MapLabel": "",
    "mapLabel": "",
    "GameMode": ""
}

let serverInfo = {
    "thisGameId": uuidv4()
}
let playerList = []

let playerListCumulative = {playerList}

function getPSQLSettings() {
    const psqlOptionsPath = 'psqlOptions.json'
    const path = thisPath + `/${psqlOptionsPath}`

    return new Promise(resolve => {
        try {
            if (fs.existsSync(path)) {
                const server = require(path)
                resolve(server)
            } else {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                rl.on("close", function () {
                    console.log(`Server Details Saved to ${path}`);
                    const server = require(path)
                    resolve(server)
                });

                console.log(`No ${psqlOptionsPath} found. Creating...`)

                rl.question("Host ? ", function (host) {
                    rl.question("Port ? ", function (port) {
                        rl.question("User ? ", function (user) {
                            rl.question("Database ? ", function (db) {
                                rl.question("Password ? ", function (password) {
                                    const serverDetails = {
                                        "host": host,
                                        "port": port,
                                        "user": user,
                                        "database": db,
                                        "password": password,
                                    }
                                    fs.writeFileSync(path, JSON.stringify(serverDetails))
                                    rl.close();
                                });
                            });
                        });
                    });
                });

            }

        } catch (err) {
            console.error(err)
        }
    })
}


function getServerFile() {

    const serverFileName = 'serverOptions.json'
    const serverPath = thisPath + `/${serverFileName}`

    return new Promise(resolve => {
        try {
            if (fs.existsSync(serverPath)) {
                const server = require(serverPath)
                resolve(server)
            } else {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                rl.on("close", function () {
                    console.log(`Server Details Saved to ${serverPath}`);
                    const server = require(serverPath)
                    resolve(server)
                });

                console.log(`No ${serverFileName} found. Creating...`)

                rl.question("Port ? ", function (port) {
                    rl.question("Password ? ", function (password) {
                        rl.question("Discord Webhook (leave blank for none) ? ", function (webhook) {
                            const serverDetails = {
                                "ip": "localhost",
                                "port": port,
                                "password": password,
                                "webhook": webhook
                            }
                            fs.writeFileSync(serverPath, JSON.stringify(serverDetails))
                            rl.close();
                        });
                    })
                });

            }

        } catch (err) {
            console.error(err)
        }
    })
}

async function postScores(activeSocket, serverFile) {

    const timeNow = new Date()
    const timeStamp = timeNow.toISOString()

    const webhookUrl = serverFile.webhook

    const thisServer = await rcon.getServerInfo(activeSocket)
    if (!thisServer) return activeSocket
    if (!thisServer.playerList) return activeSocket

    let isPlayerCountChanged = false
    if (thisServer.playerList.length != playerList.length) isPlayerCountChanged = true

    playerList = thisServer.playerList
    thisServerInfo = thisServer.serverInfo.ServerInfo
    Object.assign(serverInfo, thisServerInfo)

    let allKDASum = 0
    let allKSum = 0
    let allDSum = 0
    let allASum = 0

    try {
        if (playerList.length > 0) {

            allKDASum = sumAllKDA(playerList)
            allKSum = sumAllK(playerList)
            allDSum = sumAllD(playerList)
            allASum = sumAllA(playerList)
        }
    } catch (e) {
        console.log(e, 'playerlist:', playerList)
    }

    serverInfo.KDASum = allKDASum
    serverInfo.KSum = allKSum
    serverInfo.DSum = allDSum
    serverInfo.ASum = allASum
    const prevKDASum = latestKDAs.allKDASum
    const thisMap = serverInfo.MapLabel
    const prevMap = latestKDAs.MapLabel

    if ((allKDASum != prevKDASum) || isPlayerCountChanged) {
        //Score Change

        if ((allKDASum == 0 && allKDASum != prevKDASum) || thisMap != prevMap) {
            //New Game
            await waitMS(3000)
            
            const fullServerDetails = await servers.getFullServerInfo(activeSocket).catch(e => console.log)
            Object.assign(serverInfo, fullServerDetails.serverInfo.ServerInfo)
            latestKDAs.mapLabel = serverInfo.mapLabel
            serverInfo.thisGameId = uuidv4()
            latestKDAs.allKDASum = allKDASum
            latestKDAs.MapLabel = serverInfo.MapLabel
            latestKDAs.isNewRound = true
            console.log('New Game!',fullServerDetails)
            if (webhookUrl) {
                dMsg.sendDiscordMessage(`New Game Starting on ${serverInfo.MapLabel}!`)
            } else {
                console.log('No webhook.')
            }
            const newGamRes = await psql.writeGameID(serverInfo.thisGameId, serverInfo)
            playerListCumulative = {playerList}

        }

            

        const res = await psql.sendData(playerList, serverInfo)
            .then(x => console.log(timeStamp, 'Updated Game: ', playerList.length, 'players. Total Kills: ', serverInfo.KSum))
            .catch(e => console.log('SQL Error:', e))

        if (isPlayerCountChanged) {
            if (webhookUrl){
            const discordMsg = makeDiscordUpdateServerMessage(playerList, serverInfo)
            const dRes = await dMsg.sendDiscordMessage(discordMsg)
            }
            addToCumulativePL(playerList)
        }

        latestKDAs.allKDASum = allKDASum
        return serverInfo
    }

    else {

        if (iteration % logCyleInt == 0) {
            console.log(timeStamp, 'No KDA change. Players:', playerList.length)
            // console.log(timeStamp, 'Round', serverInfo.RoundState)
        }
        return serverInfo

    }

}

function addToCumulativePL(pl){
    // console.log('Adding:',pl.length)
    const existingPL = playerListCumulative.playerList
    pl.forEach(p=>{
        const existingPi = existingPL.findIndex(pc =>pc.PlayerInfo.UniqueId == p.PlayerInfo.UniqueId)
        if (existingPi > -1){
            existingPL[existingPi] = p
        } else {
            existingPL.push(p)
        }
        
    })
    console.log('Cumulative Players:',existingPL.length)
}

function calcRound(playerList, serverInfo) {
    let round = 0
    const kSum = serverInfo.KSum
    const playerCount = playerList.length
    const playerKills = kSum / playerCount
    const roundGuess = Math.round(playerKills / 4.5)
    return roundGuess
}

function makeDiscordUpdateServerMessage(playerList, serverInfo) {
    let msg = ''
    if (playerList.length > 0) {
        let playersTxt = ''
        try {
            const nameIntRegex = /<[0-9]. /g
            playersTxt = playerList.map(p => '_' + p.PlayerInfo.PlayerName.replace(nameIntRegex, '') + '_ - KDA ' + [sumK(p), sumD(p), sumA(p)].join('/')).join('\n')
        } catch (e) {
            console.log(e)
        }
        msg = `There ${playerList.length > 1 ? 'are' : 'is'} now **${playerList.length} ${playerList.length > 1 ? 'players' : 'player'} ** in the server, ` +
            `playing on ** ${serverInfo.MapLabel} ** with ${serverInfo.KSum} kills so far! `
            //+ `\n${playersTxt}\n`
    } else {
        msg = `There are now 0 players in the server.`
    }

    return msg
}

function sumKDA(player) {
    try {
        return player.PlayerInfo.KDA.split('/').reduce((a, b) => a + parseInt(b), 0)
    } catch (e) {
        console.log(e, 'player:', player)
        return 0
    }
}

function sumK(player) {
    try {
        return parseInt(player.PlayerInfo.KDA.split('/')[0])
    } catch (e) {
        console.log(e)
        return 0
    }
}

function sumD(player) {
    try {
        return parseInt(player.PlayerInfo.KDA.split('/')[1])
    } catch (e) {
        console.log(e)
        return 0
    }
}

function sumA(player) {
    try {
        return parseInt(player.PlayerInfo.KDA.split('/')[2])
    } catch (e) {
        console.log(e)
        return 0
    }
}

function sumAllKDA(playerList) {
    let allKDASum = sumKDA(playerList[0])
    if (playerList.length > 1) {
        allKDASum = playerList.reduce((a, b) => a + sumKDA(b), 0)
    }
    return allKDASum
}

function sumAllK(playerList) {
    let allKSum = sumK(playerList[0])
    if (playerList.length > 1) {
        allKSum = playerList.reduce((a, b) => a + sumK(b), 0)
    }
    return allKSum
}

function sumAllD(playerList) {
    let allDSum = sumD(playerList[0])
    if (playerList.length > 1) {
        allDSum = playerList.reduce((a, b) => a + sumD(b), 0)
    }
    return allDSum
}

function sumAllA(playerList) {
    let allASum = sumA(playerList[0])
    if (playerList.length > 1) {
        allASum = playerList.reduce((a, b) => a + sumA(b), 0)
    }
    return allASum
}


async function waitMS(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
    const serverFile = await getServerFile()
    console.log('ServerFile:',serverFile)
    let activeSocket = await rcon.spinServer(serverFile, spinRateMS)

    while (activeSocket.writable) {
        const cycleRes = await postScores(activeSocket, serverFile)
        await waitMS(cycleRateMS)
        iteration++
    }

    activeSocket.end()
    activeSocket.destroy()
    return activeSocket

}

module.exports = { init, getPSQLSettings, serverInfo, playerList, playerListCumulative }

