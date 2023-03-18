const fs = require('fs')
const apiF = require('./apiFunctions')
const psql = require('./psql')
const serverCalls = require('./servers')

function execShellCommand(cmd) {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
     exec(cmd, (error, stdout, stderr) => {
      if (error) {
       console.warn(error);
      }
      resolve(stdout? stdout : stderr);
     });
    });
   }

async function checkCPU(){
    const command = `top -b -n2 -p 1 | fgrep "Cpu(s)" | tail -1 | awk -F'id,' -v prefix="$prefix" '{ split($1, vs, ","); v=vs[length(vs)]; sub("%", "", v); printf "%s%.1f%%\\n", prefix, 100 - v }'`
    let resArr = await execShellCommand(command)
    resArr = resArr.split('\n')
    const cpu = parseFloat(resArr.join(''))
    return cpu
}

async function checkStorage(){
    const command = `df`
    let resArr = await execShellCommand(command)
    resArr = resArr.split('\n')
        const resLine = resArr.find(l=>l.indexOf('/dev/vda1')>-1)
        const storagePercent = resLine.split(' ').find(t=>t.indexOf('%') > 0)
        const storage = parseFloat(storagePercent)
        return storage
}

async function restartPavlov(){
    console.log(`CPU High. Restarting Pavlov...`)
    const command = `systemctl restart systemd-journald.service && systemctl restart pavlov`
    let resArr = await execShellCommand(command)
    return resArr
}

async function getCPUSnapshot(){
    console.log(`CPU High. Getting snapshots...`)
    const command = `top -b -n 1 | sed -n '8,18p'`
    let resArr = await execShellCommand(command)
    console.log(resArr)
}

async function checkAllSend(){
    const nonGamingServers = ['45.32.183.95']
    const cpu = await checkCPU()
    const storage = await checkStorage()
    const ip = await apiF.getMyIP()
    const serverRes = await serverCalls.getServers()
    const servers = serverRes.servers
    const thisServer = servers.find(s=>s.ip == ip)
    const {mapLabel, slots} = thisServer || {}
    let restart = false
    if (cpu > 95 && !nonGamingServers.includes(ip)) {
        getCPUSnapshot()
        restartPavlov()
        restart = true
    }
    console.log(ip,'CPU:',cpu,'Storage:',storage)
    psql.writeReport({ip,cpu,storage,mapLabel, slots, restart})
}

checkAllSend()
