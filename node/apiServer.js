const http = require("http");
const shell = require("shelljs")
const md5 = require("md5")
const fs = require("fs")
const path = require("path");
const express = require("express")
const bodyParser = require("body-parser")
const apiF = require('./apiFunctions')
const cors = require("cors");
const psql = require('./psql');
const { getPSQLSettings } = require("./score");
const util = require('util');

const host = '0.0.0.0';
const port = 8000;
const app = express()

// const rconPath = path.resolve(__dirname, './tests/RconSettings.txt')
// const gameIniPath = path.resolve(__dirname, './tests/Game.ini')

const rconPath = '/home/steam/pavlovserver/Pavlov/Saved/Config/RconSettings.txt'
const modsPath = '/home/steam/pavlovserver/Pavlov/Saved/Config/mods.txt'
const gameIniPath = '/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

let clientInfo = {}
let psqlSettings = {}


//Check Pass
app.use(async (req, res, next) => {
    try {

        const parseIp = (req) =>
            (typeof req.headers['x-forwarded-for'] === 'string'
                && req.headers['x-forwarded-for'].split(',').shift())
            || req.connection?.remoteAddress
            || req.socket?.remoteAddress
            || req.connection?.socket?.remoteAddress

        psqlSettings = await getPSQLSettings()
        clientInfo = {
            'clientip': parseIp(req),
            'method': req.method,
            'headers': req.headers,
            'url': req.url
        }

        const passFile = fs.readFileSync(rconPath).toString()
        const passTxt = passFile.split('=')[1].split('\n')[0]
        const md5Pass = md5(passTxt)
        if (req.get('HordePwd') == md5Pass) {
            next()
        } else {
            const errMsg = 'Incorrect Password'
            res.sendStatus(403)
            next(errMsg)
        }
    } catch (e) {
        res.sendStatus(403)
        next(e.message)
    }
})

app.get('/getGameIni', (req, res, next) => {

    try {
        const gameIniTxt = fs.readFileSync(gameIniPath).toString()
        res.send(
            apiF.iniToJSON(gameIniTxt)
        )
        next()
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

app.post('/writeGameIni', (req, res, next) => {

    try {

        const gameini = req.body.gameini
        if (!gameini) throw new Error('No Game Ini Body')

        let writeGameIni = '[/Script/Pavlov.DedicatedServer]\n'
        writeGameIni += apiF.JSONToIni(gameini)

        shell.exec('systemctl stop pavlov')
        fs.writeFileSync(gameIniPath, writeGameIni)
        shell.exec('systemctl start pavlov')
        res.send({
            'status': 'success',
            'writedata': writeGameIni,
            'writepath': gameIniPath
        })
        next();
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

app.post('/writePassword', (req, res, next) => {

    try {
        const newPassword = req.body.newpass

        const rconFileTxt = `Password=${newPassword}\nPort=9100`
        shell.exec('systemctl stop pavlov')
        fs.writeFileSync(rconPath, rconFileTxt)
        shell.exec('systemctl start pavlov')
        res.send({
            'status': 'success',
            'writedata': rconFileTxt,
            'writepath': rconPath
        })
        next();
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

app.get('/updateMaps', (req, res, next) => {

    const updateAllPath = '/root/horde/bash/updateAllRestartPavlov.sh'
    try {
        shell.exec(updateAllPath,{},()=>console.log('Done'))
        res.send({
            'status': 'success',
            'event': 'updating maps and repo'
        })
        next();
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

//Default Error
app.use((req, res, next) => {
    if (!req.route) {
        res.sendStatus(404)
        next('Bad Route')
    }
    next()
});

//Final Log
app.use(async (req, res, next) => {
    console.log(res.statusCode + ' ' + res.statusMessage)
    const resultData = {
        'status': res.statusCode
    }
    const psres = await psql.logData(psqlSettings, clientInfo, req.body, resultData)
    next()
})

//Error Handler
app.use(async (err, req, res, next) => {
    console.log(res.statusCode + ' ' + err)

    const resultData = {
        'status': res.statusCode,
        'error': err
    }
    const psres = await psql.logData(psqlSettings, clientInfo, req.body, resultData)
    next()
})

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
