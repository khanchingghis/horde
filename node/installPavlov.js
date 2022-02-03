const axios = require('axios')
const fs = require('fs')
const md5 = require('md5')
const thisPath = __dirname
const shell = require("shelljs")


async function getInstanceUserData(){

    const res = await axios.default.get('http://169.254.169.254/latest/user-data')
    if (!res.data){
        const instanceDetails = await getInstanceMetaData()
        const instanceID = instanceDetails['instance-v2-id']
        const config = {
            method:'post',
            url:'https://api.pavlovhorde.com:8003/vultr/getInstanceUserData',
            data: {
                instanceID
            }
        }
        const res2 =  await axios(config)
        return res2.data
    }
    return res.data
}

async function getInstanceMetaData(){

    const res = await axios.default.get('http://169.254.169.254/v1.json')
    return res.data
}

async function installPavlov(){

    const userData = await getInstanceUserData()

    console.log(userData)

    let {servername, rconpass, psqlOptions, serverOptions} = userData

    const psqlOptionsPath = thisPath + '/psqlOptions.json'
    const serverOptionsPath = thisPath + '/serverOptions.json'
    const serverOptionsEnc = {...serverOptions, password:md5(rconpass)}
    fs.writeFileSync(psqlOptionsPath,JSON.stringify(psqlOptions))
    fs.writeFileSync(serverOptionsPath,JSON.stringify(serverOptionsEnc))
    servername = servername.replace(`'`,`'"'"'`)
    rconpass = rconpass.replace(`'`,`'"'"'`)
    const ApiKey = serverOptions.ApiKey

    shell.exec(`ufw disable`)
    shell.exec(`/root/horde/bash/newServerInstaller.sh '${servername}' '${rconpass}' '${ApiKey}'`)
    shell.exec(`/root/horde/bash/installServices.sh`)
    shell.exec(`systemctl stop pavlov`)
    shell.exec(`/root/horde/bash/updateMaps.sh`)
    shell.exec(`/root/horde/bash/selectorLoad.sh`) 
    shell.exec(`systemctl start pavlov`)
    shell.exec(`/root/horde/bash/cleanJournal.sh`)

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

installPavlov().then("Installed.").catch(e=>console.log(e))