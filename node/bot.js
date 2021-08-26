const axios = require('axios')
const readline = require('readline')
const fs = require('fs')

const webhook = require('./serverOptions.json').webhook

async function sendDiscordMessage(msg) {

    const sendObj = {
        "content": msg,
        'username':"Horde",
        'avatar_url': "https://pavlovhorde.com/static/PHorde2-0f28d87f6d78c882bb2061c2ab9d5f67.png"
    }
    if (webhook) {
    axios.post(webhook,
        sendObj
    )
    }
}

function capFirst(string) {
    return string.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ')
}

async function waitMS(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
}

function constructStatusResponse(serverInfo) {
    const { MapLabel, ServerName, GameMode, PlayerCount, playerList } = serverInfo
    const serverStatus = []
    serverStatus.push(`**Name**: ${ServerName}`)
    serverStatus.push(`**Map**: ${MapLabel}`)
    serverStatus.push(`**Game Mode**: ${GameMode}`)
    serverStatus.push(`**Players**: ${PlayerCount}`)
    //Players/Teams
    if (playerList.length > 0) {
        playerList.sort((a, b) => a.PlayerInfo.a - b.PlayerInfo.a)
        let playerListMsgArr = []
        if (serverInfo.Teams) {
            const teamMsg = `Red: ${serverInfo.Team0Score} | Blue: ${serverInfo.Team1Score}`
            const redTeamPlayers = playerList.filter(p => p.PlayerInfo.TeamId == '0')
            const blueTeamPlayers = playerList.filter(p => p.PlayerInfo.TeamId == '1')
            const redTeamMsg = redTeamPlayers.map(p => `${p.PlayerInfo.PlayerName} - KDA ${p.PlayerInfo.KDA}`)
            const blueTeamMsg = blueTeamPlayers.map(p => `${p.PlayerInfo.PlayerName} - KDA ${p.PlayerInfo.KDA}`)
            playerListMsgArr.push(`**Red: ${serverInfo.Team0Score} Points**`, ...redTeamMsg, `**Blue: ${serverInfo.Team1Score} Points**`, ...blueTeamMsg)
        } else {
            const playerListPlayersMsg = playerList.map(p => `${p.PlayerInfo.PlayerName} - KDA ${p.PlayerInfo.KDA}`)
            playerListMsgArr.push(...playerListPlayersMsg)
        }

        // const playerListMsg =  playerListMsgArr.join('/n')
        serverStatus.push(...playerListMsgArr)
    }
    return serverStatus
}

module.exports = {sendDiscordMessage, constructStatusResponse}