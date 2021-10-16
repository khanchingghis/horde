
const shell = require("shelljs")
const axios = require("axios").default
const fs = require('fs')

function JSONToIni(json) {
    let res = ''
    const keys = Object.keys(json)
    for (const key of keys) {
        const thisValue = json[key]
        if (key=='Maps') {
            for (const map of thisValue) {
                res += `MapRotation=(MapId="${map.MapId}", GameMode="${map.GameMode}")\n`
            } 
        }
        else {
            res += `${key}=${thisValue}\n`
        }
    }
    return res
}

function iniToJSON(iniTxt){
    let jsonRes = {'ServerName':'[HORDE]','Maps':[]}
    const iniLines = iniTxt.split('\n').map(line => line.trim())
    for (const line of iniLines){
        if ( line.startsWith('#') || line.startsWith(';') || line.startsWith('[') ) continue
        if ( line.length ) {
            const thisLine = line.split('=')
            const thisKey = thisLine[0]
            if (thisLine.length == 2) {
                jsonRes[thisKey] = thisLine[1]
            } else if (thisLine.length > 2 && thisKey == 'MapRotation'){
                const thisMap = thisLine[2].split(',')[0].replace('"','')
                const thisGameMode = thisLine[3].replace(')',"").replace('"','')
                jsonRes.Maps.push({'MapId':thisMap, 'GameMode':thisGameMode})
            } else {
                continue
            }
          } 
    }
return jsonRes
}

async function getMyIP(){
    const config = {
        'method':'get',
        'url':'http://icanhazip.com/'
    }
    const res = await axios.get('http://icanhazip.com/')
    // const myIP = shell.exec(`ifconfig ens3 | grep broadcast | awk '{print $2}'`).stdout
    return res.data.trim()
}

function getLocalMaps(){
    let resJSONArr = []
    const mapsFolder = '/home/steam/pavlovserver/Pavlov/Saved/maps/'
    const mapsFolders = fs.readdirSync(mapsFolder,{withFileTypes:true})
    for (const f of mapsFolders){
        if (f.isDirectory()){
            try {
            const metadata = fs.readFileSync(mapsFolder + '/' + f.name + '/' + 'metadata.json','utf8')
            const metaObj = JSON.parse(metadata)
            resJSONArr.push(metaObj)
            } catch (e){
                console.log(e)
            }
        }
    }
    return resJSONArr
}

module.exports = {iniToJSON, JSONToIni, getMyIP, getLocalMaps}