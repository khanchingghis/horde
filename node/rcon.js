const net = require('net')
const fs = require('fs');

//returns socket obj
function spinServer(server) {
    return new Promise(resolve => {
        socket = net.Socket();
        socket.connect(server.port, server.ip, () => { });
        socket.setTimeout(10000);
        socket.on('timeout', () => {
            console.log('socket timeout');
            resolve(socket)
        });
        socket.on('error', function (err) {
            console.log(err)
            resolve(socket)
        });
        socket.on('data', function (data) {
            if (data.toString().startsWith('Password:')) {
                socket.write(server.password)
                //console.log(data.toString())
            }
            if (data.toString().startsWith('Authenticated=1')) {
                // console.log('Logged in!');
                (async () => {
                    socket.serverDetails = await getServerDetails(socket)
                    resolve(socket);
                })();
            }
            if (data.toString().startsWith('Authenticated=0')) {
                console.log('Login wrong!');
            }
        });
    });
}


async function getServerDetails(socket) {
    // let socket = await spinServer(server)
    let playerDetails = []
    const refreshList = JSON.parse(await commandHandler(socket, 'RefreshList'))
    const playerList = refreshList.PlayerList
    if (playerList.length > 0) {
    for (const p of playerList) {
        const pID = p.UniqueId
        const pDetails = JSON.parse(await commandHandler(socket, 'InspectPlayer ' + pID))
        playerDetails.push(pDetails)
    }}
    const serverInfo = JSON.parse(await commandHandler(socket, 'ServerInfo'))
    const respObj = {"serverInfo" : serverInfo, "playerList": playerDetails}
    return respObj
}

function commandHandler(socket, command) {
    return new Promise(resolve => {
        socket.write(command)
        socket.once('data', function (data) {
            const dataResult = data.toString()
            return resolve(dataResult)
        });
    }
    )
}

async function processCommands(server, commands) {
    let activeSocket = await spinServer(server)
    let allRes = []
    for (const cmd of commands) {
        const thisCmd = await commandHandler(activeSocket, cmd)
        allRes.push(JSON.parse(thisCmd))
    }
    activeSocket.end()
    activeSocket.destroy()
    return allRes
}

async function getServerInfo(server){
    const socket = await spinServer(server)
    const details = socket.serverDetails
    socket.end()
    socket.destroy()
    return details
}

module.exports = { getServerInfo, processCommands }