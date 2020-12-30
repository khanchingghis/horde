
function JSONToIni(json) {
    let res = ''
    const keys = Object.keys(json)
    for (const key of keys) {
        const thisValue = json[key]
        if (key=='Maps') {
            for (const map of thisValue) {
                res += `MapRotation=(MapId="${map.MapId}", GameMode="${map.GameMode}")\n`
            }
        } else {
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
                const thisMap = thisLine[2].split(',')[0]
                const thisGameMode = thisLine[3].replace(')',"")
                jsonRes.Maps.push({'MapId':thisMap, 'GameMode':thisGameMode})
            } else {
                continue
            }
          } 
    }
return jsonRes
}

module.exports = {iniToJSON, JSONToIni}