const axios = require('axios')
const fs = require('fs')
const md5 = require('md5')
const thisPath = __dirname
const shell = require("shelljs")
const { getMyIP } = require('./apiFunctions')


async function getInstanceUserData(){

    const res = await axios.default.get('http://169.254.169.254/latest/user-data')
    if (!res.data){
        const instanceDetails = await getInstanceMetaData()
        const instanceID = instanceDetails['instance-v2-id']
        const config = {
            method:'post',
            url:'https://api2.pavlovhorde.com:8003/vultr/getInstanceUserData',
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

async function checkPassword(newRCONPass, user, serverip){
   
    const config = {
        method:'post',
        url:'https://api2.pavlovhorde.com:8003/changeRCONPasswordFromServer',
        data:{
            newRCONPass, user, serverip
        }
    }

    const res = await axios(config)
    return res
}


async function installPavlov(){

    const userData = await getInstanceUserData()
    const myIP = await getMyIP()


    console.log(userData)

    let {servername, rconpass, psqlOptions, serverOptions, username} = userData

    

    const psqlOptionsPath = thisPath + '/psqlOptions.json'
    const serverOptionsPath = thisPath + '/serverOptions.json'
    const serverOptionsEnc = {...serverOptions, password:md5(rconpass)}
    fs.writeFileSync(psqlOptionsPath,JSON.stringify(psqlOptions))
    fs.writeFileSync(serverOptionsPath,JSON.stringify(serverOptionsEnc))
    servername = servername.replace(`'`,`'"'"'`)
    rconpass = rconpass.replace(`'`,`'"'"'`)
    const ApiKey = serverOptions.ApiKey
    const isRC = (serverOptions.isRC === 'true' || serverOptions.isRC === 'True' || serverOptions.isRC === true)

    
    //check/set my RCON pass in DB
    try {
    const passCheckRes = await checkPassword(rconpass,username, myIP)
    console.log(JSON.stringify(passCheckRes.data))
    } catch (e){
        console.log(`Could not change pass`,e)
    }


    console.log(`Installing ${isRC ? 'RC' : 'Live'} server...`)

    shell.exec(`ufw disable`)
    if (isRC){
        shell.exec(`/root/horde/bash/newServerInstallerRC.sh '${servername}' '${rconpass}' '${ApiKey}'`)
        shell.exec(`/root/horde/bash/installServicesRC.sh`)
        shell.exec(`systemctl stop pavlov`)
        shell.exec(`/root/horde/bash/updateMapsRC.sh`) 
        shell.exec(`systemctl start pavlov`)
        shell.exec(`/root/horde/bash/cleanJournal.sh`)
    } else {
        shell.exec(`/root/horde/bash/newServerInstaller.sh '${servername}' '${rconpass}' '${ApiKey}'`)
        shell.exec(`/root/horde/bash/installServices.sh`)
        shell.exec(`systemctl stop pavlov`)
        shell.exec(`/root/horde/bash/updateMaps.sh`)
        shell.exec(`/root/horde/bash/selectorLoad.sh`) 
        shell.exec(`systemctl start pavlov`)
        shell.exec(`/root/horde/bash/cleanJournal.sh`)
    
    }
    
    

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

installPavlov().then("Installed.").catch(e=>console.log(e))