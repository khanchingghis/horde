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
const util = require('util');

const host = '0.0.0.0';
const port = 8001;
const app = express()

// const rconPath = path.resolve(__dirname, './tests/RconSettings.txt')
// const gameIniPath = path.resolve(__dirname, './tests/Game.ini')

const rconPath = '/home/steam/pavlovserver/Pavlov/Saved/Config/RconSettings.txt'
const modsPath = '/home/steam/pavlovserver/Pavlov/Saved/Config/mods.txt'
const gameIniPath = '/home/steam/pavlovserver/Pavlov/Saved/Config/ModSave/Game.txt'
const gameIniPathR = '/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini'
const serverOptionsPath = '/root/horde/node/serverOptions.json'
const hordeBashPath = '/root/horde/bash/'

let myIP = ''

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

let clientInfo = {}


//Check Pass
app.use(async (req, res, next) => {

    // console.log(req)

    try {

        const clientip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null)

        clientInfo = {
            'clientip': clientip,
            'method': req.method,
            'headers': req.headers,
            'url': req.url,
            'destinationip': myIP
        }

        const passFile = fs.readFileSync(rconPath).toString()
        const passTxt = passFile.split('=')[1].split('\n')[0]
        const md5Pass = md5(passTxt)
        const passReceived = req.get('HordePwd')
        console.log('Pass Required:',passTxt, 'MD5 option:', md5Pass, 'Pass Received:',passReceived)
        if ((passReceived == md5Pass) || (passReceived == passTxt)) {
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
        const responseObj = apiF.iniToJSON(gameIniTxt)
        res.send(responseObj)
        res.sentObj = responseObj
        next()
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

app.get('/getWebhook', (req, res, next) => {

    try {
        const serverOptions = JSON.parse(fs.readFileSync(serverOptionsPath,'utf8'))
        const webhook = serverOptions.webhook
        res.send(webhook)
        res.sentObj = webhook
        next()
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

app.post('/writeGameIni', (req, res, next) => {

    try {

        const gameini = req.body.gameini
        const homeMap = gameini.myHomeMap || 'SVR_Chingghis_Select'
        
        if (!gameini) throw new Error('No Game Ini Body')

        let writeGameIni = '[/Script/Pavlov.DedicatedServer]\n'
        writeGameIni += apiF.JSONToIni(gameini)

        let writeGameIniR = '[/Script/Pavlov.DedicatedServer]\n'

        shell.exec('systemctl stop pavlov')
        
        const    = gameini.selector
        if ( !selector || selector == 'None'){
            console.log('updating selector')
            fs.writeFileSync(gameIniPath, writeGameIni)
            fs.writeFileSync(gameIniPathR, writeGameIni)
        } else {
            console.log('updating selector')
            let gameiniR = {...gameini, Maps:[{MapId:homeMap,GameMode:'DM'}]}
            writeGameIniR += apiF.JSONToIni(gameiniR)
            fs.writeFileSync(gameIniPath, writeGameIni)
            fs.writeFileSync(gameIniPathR, writeGameIniR)
            shell.exec(`${hordeBashPath}selectorUpdate.sh ${selector}`)
        }
        
        shell.exec('systemctl start pavlov')
        const responseObj = {
            'status': 'success',
            'writedata': {writeGameIni, writeGameIniR},
            'writepath': gameIniPath
        }
        res.send(responseObj)
        res.sentObj = responseObj
        next();
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

app.post('/writeWebhook', (req, res, next) => {

    try {

        const webhook = req.body.webhook
        if (!webhook) throw new Error('No Webhook Body')

        const oldServerOptions = JSON.parse(fs.readFileSync(serverOptionsPath,'utf8'))
        const newServerOptions = {...oldServerOptions, webhook}

        shell.exec('systemctl stop hordeScore')
        fs.writeFileSync(serverOptionsPath, JSON.stringify(newServerOptions))
        shell.exec('systemctl start hordeScore')
        const responseObj = {
            'status': 'success',
            'writedata': webhook
        }
        res.send(responseObj)
        res.sentObj = responseObj
        next();
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

app.post('/writePassword', (req, res, next) => {

    try {
        const newPassword = req.body.newpass

        const rconFileTxt = `Password=${newPassword}\nPort=9100\n`
        const serverOptionsObj = require(serverOptionsPath)
        const serverOptionsEnc = {...serverOptionsObj, password:md5(newPassword)}
        const gameIniTxt = fs.readFileSync(gameIniPath).toString()
        const gameIniObj = apiF.iniToJSON(gameIniTxt)

        shell.exec('systemctl stop pavlov')
        //write rconsettings
        fs.writeFileSync(rconPath, rconFileTxt)

        //write serveroptions for scores
        fs.writeFileSync(serverOptionsPath,JSON.stringify(serverOptionsEnc))

        //write selector pass
        const selectorLoadRes = shell.exec(`${hordeBashPath}selectorUpdate.sh "${gameIniObj.selector}"`)
        console.log(`Changed Password`, newPassword, gameIniObj.selector)
        shell.exec('systemctl start pavlov')

        const responseObj = {
            'status': 'success',
            'writedata': {rconFileTxt,serverOptionsObj}
        }
        res.send(responseObj)
        res.sentObj = responseObj
        next();
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

app.get('/updateMaps', (req, res, next) => {

    const updateAllPath = '/root/horde/bash/updateAllRestartPavlov.sh'
    try {
        shell.exec(updateAllPath, {}, () => console.log('Done'))
        const responseObj = {
            'status': 'success',
            'event': 'updating maps and repo'
        }
        res.send(responseObj)
        res.sentObj = responseObj
        next();
    } catch (e) {
        res.sendStatus(404)
        next(e.message)
    }
})

app.get('/getMapsJSON', async (req, res, next) => {

    try {
        const mapsJSON = await apiF.getLocalMaps()
        res.send(mapsJSON)
        next()
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
    console.log(`${req.path} - ${res.statusCode} - ${res.statusMessage}`)
    const resultData = {
        'status': res.statusCode,
        'body': res.sentObj || 'undefined'
    }
    const psres = await psql.logData(clientInfo, req.body, resultData)
    next()
})

//Error Handler
app.use(async (err, req, res, next) => {
    console.log(res.statusCode + ' ' + err)

    //log destination ip
    const resultData = {
        'status': res.statusCode,
        'error': err,
        'body': res.sentObj || 'undefined'
    }
    const psres = await psql.logData(clientInfo, req.body, resultData)
    next()
})

apiF.getMyIP().then(x => {
    myIP = x

    app.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}, public ip is ${myIP}`);
    });
})

