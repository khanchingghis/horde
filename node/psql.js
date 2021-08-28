const { Pool, Client } = require('pg')
const score = require('./score')
const writerPSQLSettings = require('./psqlOptions.json')

const pool = new Pool(writerPSQLSettings)

async function sendData(playerList, serverInfo) {

    try{
    const nameIntRegex = /<[0-9]. /g
    let playerListFormatted = playerList.map(e => {
        const kda = e.PlayerInfo.KDA.split('/')
        e.PlayerInfo.k = parseInt(kda[0])
        e.PlayerInfo.d = parseInt(kda[1])
        e.PlayerInfo.a = parseInt(kda[2])
        e.PlayerInfo.PlayerName = e.PlayerInfo.PlayerName.replace(nameIntRegex, "")
        e.PlayerInfo.TeamId = parseInt(e.PlayerInfo.TeamId)
        return e
    });

    playerListFormatted = JSON.stringify(playerListFormatted)
    const serverInfoFormatted = JSON.stringify(serverInfo)

    pool.query(`INSERT INTO raw_scores (playerList, serverInfo) VALUES ($1, $2)`, [playerListFormatted, serverInfoFormatted])
    } catch (e){
        console.log(e,'Playerlist:',playerList,'serverInfo:',serverInfo)
    }
}

async function logData(clientId, data, result) {

    pool.query(`INSERT INTO logs (client, body_data, result) VALUES ($1, $2, $3)`, [clientId, data, result])

}

async function writeReport(report) {
    const thisQuery = `INSERT INTO monitor (report) VALUES ($1)`
    const res = await pool.query(thisQuery, [report])
    return res.rows
}

async function writeKillData(gameid, killer, killed, killedby, headshot, teamkill){
    const thisQuery = `INSERT INTO killstream (gameid, killer, killed, killedby, headshot, teamkill) VALUES ($1,$2,$3,$4,$5, $6)`
    const res = await pool.query(thisQuery, [gameid, killer, killed, killedby, headshot, teamkill])
    return res.rows
}

async function writeStatData(gameid, playerid, kill, death, assist, headshot, experience, teamkill, bombplanted, bombdefused){
    const thisQuery = `INSERT INTO allstats (gameid, playerid, kill, death, assist, headshot, experience, teamkill, bombplanted, bombdefused) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`
    const res = await pool.query(thisQuery, [gameid, playerid, kill, death, assist, headshot, experience, teamkill, bombplanted, bombdefused])
    return res.rows
}

async function writeBombData(gameid, playerid, interaction){
    const thisQuery = `INSERT INTO bombstats (gameid, playerid, interaction) VALUES ($1,$2,$3)`
    const res = await pool.query(thisQuery, [gameid, playerid, interaction])
    return res.rows
}

async function writeRoundData(gameid, roundno, winningteam){
    const thisQuery = `INSERT INTO roundstats (gameid, roundno, winningteam) VALUES ($1,$2,$3)`
    const res = await pool.query(thisQuery, [gameid, roundno, winningteam])
    return res.rows
}

async function writeGameID(gameid, serverinfo){
    const thisQuery = `INSERT INTO gamestats (gameid, serverinfo) VALUES ($1,$2)`
    const res = await pool.query(thisQuery, [gameid, serverinfo])
    return res.rows
}

module.exports = { writeReport, sendData, logData, writeKillData, writeStatData, writeBombData, writeRoundData, writeGameID }