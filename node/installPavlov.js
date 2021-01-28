const axios = require('axios')
const fs = require('fs')
const thisPath = __dirname
const shell = require("shelljs")


async function getInstanceUserData(){

    const res = await axios.default.get('http://169.254.169.254/latest/user-data')
    return res.data
}

async function getInstanceMetaData(){

    const res = await axios.default.get('http://169.254.169.254/v1.json')
    return res.data
}

async function installPavlov(){

    const userData = await getInstanceUserData()

    const {servername, rconpass, psqlOptions, serverOptions} = userData

    
    const psqlOptionsPath = thisPath + '/psqlOptions.json'
    const serverOptionsPath = thisPath + '/serverOptions.json'
    fs.writeFileSync(psqlOptionsPath,psqlOptions)
    fs.writeFileSync(serverOptionsPath,serverOptions)

    shell.exec(`/root/horde/bash/newServerInstaller.sh ${servername} ${rconpass}`)

}

installPavlov().then("Installed.").catch(e=>console.log(e))