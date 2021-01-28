const net = require('net')
const fs = require('fs');
let socket = {}

//returns socket obj
function spinServer(server, spinRateMS) {
    return new Promise(resolve => {
        socket = net.Socket();
        socket.connect(server.port, server.ip, () => { });
        //socket.setTimeout(10000);
        // socket.on('timeout', () => {
        //     console.log('socket timeout');
        //     resolve(socket)
        // });
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

                const iid = setInterval(function() {
                    (async() => {
                        if (!socket.writable) {
                            socket.end()
                            socket.destroy()
                            clearInterval(iid)
                            return socket
                        } else {
                            socket.serverDetails = await getServerDetails(socket)
                        }
                    })();
                }, spinRateMS)
                ;
            }
            if (data.toString().startsWith('Authenticated=0')) {
                console.log('RCON login not authenticated!');
            }
        });
    });
}


async function getServerDetails(socket) {
    // let socket = await spinServer(server)
    let playerDetails = []
    const refreshList = await commandHandler(socket, 'RefreshList')
    const playerList = refreshList.PlayerList
    if (playerList.length > 0) {
    for (const p of playerList) {
        const pID = p.UniqueId
        const pDetails = await commandHandler(socket, 'InspectPlayer ' + pID)
        playerDetails.push(pDetails)
    }}
    const serverInfo = await commandHandler(socket, 'ServerInfo')
    const respObj = {"serverInfo" : serverInfo, "playerList": playerDetails}
    return respObj
}

async function commandHandler(socket, command){
    const try1 = await commandExecute(socket, command)
    if (try1) {
        return try1
    } else {
        const try2 = await commandExecute(socket, command)
        return try2
    }
}

function commandExecute(socket, command) {
    return new Promise(resolve => {
        socket.write(command)
        socket.once('data', function (data) {
            const dataResult = data.toString()
            try {
                const jsonResult = JSON.parse(dataResult)
                return resolve(jsonResult)
            } catch(e){
                console.log('Bad rcon Response:', command, dataResult)
                return resolve(null)
            }
            
        });
    }
    )
}

async function processCommands(server, commands) {
    let activeSocket = await spinServer(server)
    let allRes = []
    for (const cmd of commands) {
        const thisCmd = await commandHandler(activeSocket, cmd)
        allRes.push(thisCmd)
    }
    activeSocket.end()
    activeSocket.destroy()
    return allRes
}

function getServerInfo(activeSocket){
    return activeSocket.serverDetails
}

module.exports = { getServerInfo, processCommands,spinServer }