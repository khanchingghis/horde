const http = require("http");
const shell = require("shelljs")
const md5 = require("md5")
const fs = require("fs")
const path = require("path");
const express = require("express")
const bodyParser = require("body-parser")
const apiF = require('./apiFunctions')

const host = 'localhost';
const port = 8000;
const app = express()

// const rconPath = '/home/steam/pavlovserver/Pavlov/Saved/Config/RconSettings.txt'
const rconPath = path.resolve(__dirname, './tests/RconSettings.txt')

const modsPath = '/home/steam/pavlovserver/Pavlov/Saved/Config/mods.txt'
// const gameIniPath = '/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini'
const gameIniPath = path.resolve(__dirname, './tests/Game.ini')


const passFile = fs.readFileSync(rconPath).toString()
const passTxt = passFile.split('=')[1].split('\n')[0]
const md5Pass = md5(passTxt)
console.log(md5Pass)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
    console.log(JSON.stringify(req.headers))
    try {
        if (req.get('HordePwd') == md5Pass) {
            next()
        } else {
            console.log('Incorrect Password')
            res.status(403).end()
        }
    } catch (e) {
        console.log('Error')
        res.status(403).end()
    }
})

app.get('/getGameIni', (req, res) => {

    try {
    const gameIniTxt = fs.readFileSync(gameIniPath).toString()
    res.writeHead(200);
    res.end(
        gameIniTxt
    );
    } catch(e){
        res.status(404).end()
    }
})

app.post('/writeGameIni', (req, res) => {

    try {
    const gameini = req.body.gameini

    let writeGameIni = '[/Script/Pavlov.DedicatedServer]\n'
    writeGameIni += apiF.JSONToIni(gameini)

    console.log(writeGameIni)
    shell.exec('systemctl stop pavlovserver')
    fs.writeFileSync(gameIniPath, writeGameIni)
    shell.exec('systemctl start pavlovserver')
    res.writeHead(200);
    res.end(
        `Written: ${writeGameIni} to \n${gameIniPath}`
    );
} catch(e){
    res.status(404).end()
}
})

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

