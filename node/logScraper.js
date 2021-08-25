const fs = require('fs')
const psql = require('./psql')
Tail = require('tail').Tail;
let currentGameId = 'test'
const bot = require('./bot')

function setCurrentGameID(gameid){
    currentGameId = gameid
}

const remoteLogPath = '/home/steam/pavlovserver/Pavlov/Saved/Logs/Pavlov.log'



async function handleObject(obj){
    const keys = Object.keys(obj)
    const statType = keys[0]
    switch (statType){
        case "KillData": await handleKillData(obj); break;
        case "allStats": await handleAllStats(obj); break;
        case "BombData": await handleBombData(obj); break;
        case "RoundEnd": await handleRoundEnd(obj); break;
        default: console.log(keys[0], 'Not recognised')
    }
    
}

async function handleKillData(obj){
    
    //Store in DB
    const {Killer, Killed, KilledBy, Headshot} = obj.KillData
    const sendRes = await psql.writeKillData(currentGameId,Killer, Killed, KilledBy, Headshot)
 
    //Send Kill Msg
    const killMsg = `${Headshot ? '**HEADSHOT!**' : ''} ${Killer} killed ${Killed} with ${KilledBy}`
    bot.sendDiscordMessage(killMsg)

    console.log(`Sent ${Object.keys(obj)[0]}`)
}

async function handleAllStats(obj){

    //Store in DB
    const playerStats = obj.allStats.map(stat => {
        const playerid = stat.uniqueId
        const playerStatsArr = stat.stats
        let playerStatObj = {playerid}
        playerStatsArr.forEach(ps => { playerStatObj[ps.statType] = ps.amount })
        return playerStatObj
    })
    const promArr = playerStats.map(playerStatObj => {
        const { Kill, Death, Assist, Headshot, TeamKill, BombDefused, BombPlanted, Experience } = playerStatObj
        return psql.writeStatData(currentGameId, playerid, Kill, Death, Assist, Headshot, Experience, TeamKill, BombPlanted, BombDefused)
    })

    const sendRes = await Promise.all(promArr)
    

    //Send AllStats Msg
    const playerStatMsg = playerStats.map(playerStatObj => {
        const { playerid, Kill, Death, Assist, Headshot, TeamKill, BombDefused, BombPlanted, Experience } = playerStatObj
        return `${playerid} K/D/A/XP - ${Kill}/${Death}/${Assist}/${Experience}`
    })
    const allStatMsg = `Game Over. Final Stats: \n${playerStatMsg.join('\n')}`
    bot.sendDiscordMessage(allStatMsg)

    console.log(`Sent ${Object.keys(obj)[0]}`)
}

async function handleBombData(obj){
    const {Player, BombInteraction} = obj.BombData
    await psql.writeBombData(currentGameId,Player,BombInteraction)

    //Send msg
    const bombMsg = BombInteraction == 'BombPlanted' ? `${Player} has planted the bomb!` : `${Player} has defused the bomb!`
    bot.sendDiscordMessage(bombMsg)

    console.log(`Sent ${Object.keys(obj)[0]}`)
}

async function handleRoundEnd(obj){
    const {Round, WinningTeam} = obj.RoundEnd
    await psql.writeRoundData(currentGameId,Round,WinningTeam)

    //Send msg
    const roundMsg = `${WinningTeam == 0 ? 'Red' : 'Blue'} Team has won Round ${Round}`
    bot.sendDiscordMessage(roundMsg)

    console.log(`Sent ${Object.keys(obj)[0]}`)
}

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
                    handleObject(jsonObj)
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
}

module.exports = {handleObject, watchLog, setCurrentGameID, currentGameId}