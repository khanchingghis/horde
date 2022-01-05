const fs = require('fs')
const psql = require('./psql')
Tail = require('tail').Tail;
const bot = require('./bot')
const score = require('./score')

let currentServerInfo = {}
let currentPlayerList = {}
let cumulativePlayerList = {}
let lastRoundWinningTeam = 0
let selectorMaps = ['SVR_Chingghis_Select']

const remoteLogPath = '/home/steam/pavlovserver/Pavlov/Saved/Logs/Pavlov.log'

async function handleObject(obj) {
    const keys = Object.keys(obj)
    const statType = keys[0]
    switch (statType) {
        case "KillData": await handleKillData(obj); break;
        case "allStats": await handleAllStats(obj); break;
        case "BombData": await handleBombData(obj); break;
        case "RoundEnd": await handleRoundEnd(obj); break;
        case "RoundState": await handleRoundState(obj); break;
        // case "SwitchTeam": await handleSwitchTeam(obj); break;
        default: console.log(keys[0], 'Not recognised')
    }

}

async function handleRoundState(obj){
    const {State} = obj.RoundState
    console.log('Round:',State)
}

// async function handleSwitchTeam(obj){
//     const {PlayerID, NewTeamID} = obj.SwitchTeam
//     console.log(PlayerID,' Switched to ',NewTeamID)
// }

async function handleKillData(obj) {
    // const thisPlayerList = score.playerListCumulative.playerList
    // console.log(Killer,'PLLength:',thisPlayerList)
    // console.log('LocalCumList:', currentPlayerList.length)
    
    const { Killer, Killed, KilledBy, Headshot, KillerTeamID, KilledTeamID } = obj.KillData

    // const killerPL = currentPlayerList.find(p=>p.PlayerInfo.UniqueId == Killer)
    // const killedPL = currentPlayerList.find(p=>p.PlayerInfo.UniqueId == Killed)
    // let isTK = false
    // try{
    // isTK = currentServerInfo.Teams && killerPL.PlayerInfo.TeamId == killedPL.PlayerInfo.TeamId
    // } catch(e){
    //     console.log('No Match',Killer,Killed)
    // }

    const isTK = KillerTeamID == KilledTeamID

    const emojis = getEmojis(isTK,Headshot,KilledBy)

    //Store in DB
    const sendRes = await psql.writeKillData(currentServerInfo.thisGameId, Killer, Killed, KilledBy, Headshot, isTK, KillerTeamID, KilledTeamID)

    const exclamations = `${isTK ? '**TEAMKILL!** ':''}${Headshot ? '**HEADSHOT!** ' : ''}`

    //Send Kill Msg
    const isSelectorMap = selectorMaps.includes(currentServerInfo.mapId)
    if (!isSelectorMap) {
        const killMsg = `${Killer} > ${Killed} (${KilledBy}) ${emojis}`
        bot.sendDiscordMessage(killMsg)
        console.log(killMsg)
    }
}

async function handleAllStats(obj) {

    const { MapLabel, ServerName, GameMode, PlayerCount, Teams } = currentServerInfo
    console.log('RCON:',currentServerInfo, score.playerList)
    
    let isTeamGame = Teams
    //Process players Obj
    const playerStats = obj.allStats.map(stat => {
        const playerid = stat.uniqueId
        const playerStatsArr = stat.stats
        let playerStatObj = { playerid }
        playerStatsArr.forEach(ps => { playerStatObj[ps.statType] = ps.amount })
        const thisPlayerInfo = currentPlayerList.find(p => p.PlayerInfo.UniqueId == playerid)
        const thisPlayerTeam = thisPlayerInfo && thisPlayerInfo.PlayerInfo.TeamId || 0
        playerStatObj.TeamId = thisPlayerTeam
        return playerStatObj
    })

    //Write to DB
    const promArr = playerStats.map(playerStatObj => {
        const { Kill, Death, Assist, Headshot, TeamKill, BombDefused, BombPlanted, Experience, playerid } = playerStatObj
        return psql.writeStatData(currentServerInfo.thisGameId, playerid, Kill, Death, Assist, Headshot, Experience, TeamKill, BombPlanted, BombDefused)
    })

    const sendRes = await Promise.all(promArr)


    //Send AllStats Msg
    const isSelectorMap = selectorMaps.includes(currentServerInfo.mapId)
    if (!isSelectorMap) {
        const playerStatsSorted = playerStats.sort((a, b) => b.Experience - a.Experience)
        console.log('PlayerStatsSorted:', playerStatsSorted)
        let playerStatMsgArr = []

        playerStatMsgArr.push(`**Name**: ${ServerName}`)
        playerStatMsgArr.push(`**Map**: ${MapLabel}`)
        playerStatMsgArr.push(`**Game Mode**: ${GameMode}`)
        playerStatMsgArr.push(`**Players**: ${PlayerCount}`)

        if (isTeamGame) {
            const redTeamPlayers = playerStatsSorted.filter(p => p.TeamId == 0)
            const blueTeamPlayers = playerStatsSorted.filter(p => p.TeamId == 1)

            let redScore = parseInt(currentServerInfo.Team0Score, 10)
            let blueScore = parseInt(currentServerInfo.Team1Score, 10)
            if (redScore < 10 && blueScore < 10) {
                if (lastRoundWinningTeam == 0) redScore++
                if (lastRoundWinningTeam == 1) blueScore++
            }

            const redTeamMsgArr = constructStatsMsgArr(redTeamPlayers)

            const blueTeamMsgArr = constructStatsMsgArr(blueTeamPlayers)

            playerStatMsgArr.push(`**Red: ${currentServerInfo.Team0Score} Points**`, ...redTeamMsgArr, `**Blue: ${currentServerInfo.Team1Score} Points**`, ...blueTeamMsgArr)

        } else {
            playerStatMsgArr = constructStatsMsgArr(playerStatsSorted)
        }


        const headShotsMsgArr = constructStatsMsgArrSingleDetail(playerStatsSorted, 'Headshot')
        const headShotIntro = headShotsMsgArr.length > 0 ? '**Headshots:** 🤯' : ''
        const plantedMsgArr = constructStatsMsgArrSingleDetail(playerStatsSorted, 'BombPlanted')
        const plantedIntro = plantedMsgArr.length > 0 ? '**Bombs Planted:** 💣' : ''
        const defusedMsgArr = constructStatsMsgArrSingleDetail(playerStatsSorted, 'BombDefused')
        const defusedIntro = defusedMsgArr.length > 0 ? '**Bombs Defused:** 💣' : ''
        const TKMsgArr = constructStatsMsgArrSingleDetail(playerStatsSorted, 'TeamKill')
        const TKIntro = TKMsgArr.length > 0 ? '**Teamkills:**❌' : ''
        const divider = '-----------'

        const allStatMsg = [divider, `**GAME OVER!**`, ...playerStatMsgArr, divider, headShotIntro, ...headShotsMsgArr, plantedIntro, ...plantedMsgArr, defusedIntro, ...defusedMsgArr, TKIntro, ...TKMsgArr, divider].join('\n')
        bot.sendDiscordMessage(allStatMsg)
        console.log(`Sent ${Object.keys(obj)[0]}`)
    }

    
}

function getEmojis(isTK,Headshot,KilledBy){
    const emojis = require('./emojis.json')
    const killedByEmojiArr = emojis.KilledBy
    const killedByEmoji=killedByEmojiArr.find(e=>e.code==KilledBy)
    const killedByEmojiDefault = killedByEmojiArr.find(e=>e.code=='gun')
    const TKEmoji = emojis.TK.emoji
    const headshotEmoji = emojis.Headshot.emoji
    let emojisArr = []
    if (isTK) emojisArr.push(TKEmoji)
    if (Headshot) emojisArr.push(headshotEmoji)
    if (killedByEmoji) {
        emojisArr.push(killedByEmoji.emoji)
    } 
    // else {
    //     emojisArr.push(killedByEmojiDefault.emoji)
    // }
    return emojisArr.join('')
}

function constructStatsMsgArr(playerStatsArr) {
    const playerStatsMsg = playerStatsArr.map(playerStatObj => {

        const { playerid, Kill, Death, Assist, Headshot, TeamKill, BombDefused, BombPlanted, Experience } = playerStatObj

        return `${playerid} K/D/A/XP - ${Kill || 0}/${Death || 0}/${Assist || 0}/${Experience || 0}`
    })
    return playerStatsMsg
}

function constructStatsMsgArrSingleDetail(playerStatsArr,objectKey){
    const filteredArr = playerStatsArr.filter(p => p[objectKey])
    const sortedArr = filteredArr.sort((a,b)=>b[objectKey]-a[objectKey])
    const msgArr = sortedArr.map(h=>`${h.playerid}: ${h[objectKey]}`)
    return msgArr
}

async function handleBombData(obj) {
    const { Player, BombInteraction } = obj.BombData
    await psql.writeBombData(currentServerInfo.thisGameId, Player, BombInteraction)

    //Send msg
    let bombMsg = ''
    switch (BombInteraction){
        case 'BombPlanted': bombMsg=`**BOMB PLANTED by ${Player}!** 💣`; break;
        case 'BombDefused': bombMsg=`**BOMB DEFUSED by ${Player}!** 💣`; break;
        case 'BombExploded': bombMsg=`**BOMB EXPLODED!** 💣`; break;
    }
    bot.sendDiscordMessage(bombMsg)

    console.log(`Sent ${Object.keys(obj)[0]}`)
}

async function handleRoundEnd(obj) {
    const { Round, WinningTeam } = obj.RoundEnd
    lastRoundWinningTeam = WinningTeam
    await psql.writeRoundData(currentServerInfo.thisGameId, Round, WinningTeam)

    const scoresMsg = `Red: ${currentServerInfo.Team0Score} | Blue: ${currentServerInfo.Team1Score}`

    //Send msg
    if (currentServerInfo.slots > 0){
    const roundMsg = `${WinningTeam == 0 ? '**Red' : '**Blue'} Team** has won Round ${Round}\n${scoresMsg}`
    bot.sendDiscordMessage(roundMsg)

    console.log(`Sent ${Object.keys(obj)[0]}`)
    }
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
                    jsonObj.gameid = currentServerInfo.thisGameId
                    handleObject(jsonObj)
                    //clear collection
                    collectionArr = []
                } catch (e) {
                    console.log(e, jsonStr)
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

function updateLogPlayerList(playerList){
    currentPlayerList = playerList
}

function updateLogServerInfo(serverinfo){
    currentServerInfo = serverinfo
}

module.exports = { handleObject, watchLog, updateLogPlayerList, updateLogServerInfo }