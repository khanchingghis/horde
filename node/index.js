const net = require('net')
const fs = require('fs');
const server = require('./serverInfo.json')
const path = require("path")
const weaponsArray = fs.readFileSync(path.resolve(__dirname, 'weaponsRotationList.txt')).toString().split("\n")

giveAllWeaponsLoop().then(console.log('Giving WW2 Weapons...'))

async function giveAllWeaponsLoop() {
    let activeSocket = await spinServer(server)
    //console.log(activeSocket)
    let playerList = activeSocket.playerList.PlayerList
    while (playerList.length > 0) {
            await giveWeapons(weaponsArray[i], playerList)
            await sleep(30000)
    }
    console.log("No Players! Stopping Weapons Rotation")
    activeSocket.destroy()
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }  


async function getPlayerList() {
    let activeSocket = await spinServer(server)
    //console.log(activeSocket)
    let playerList = activeSocket.playerList.PlayerList
    activeSocket.destroy()
    return playerList
}

async function giveWeapons(weaponTxt, playerList) {
    console.log('Giving to ' + JSON.stringify(playerList))
    if (playerList) {
        let promiseArray = []
        playerList.forEach(player => {
            const command = 'GiveItem ' + player.UniqueId + ' ' + weaponTxt
            console.log(command)
            const commandPromise = commandHandler(activeSocket, command)
            promiseArray.push(commandPromise)
        });
        const giveAll = await Promise.all(promiseArray)
        console.log(giveAll)
    }
}

function commandHandler(socket, command) {
    return new Promise(resolve => {
        socket.write(command)
        socket.once('data', function (data) {
            return resolve(data.toString())
        });
    }
    )
}


//returns socket obj
function spinServer(server) {
    return new Promise(resolve => {
        socket = net.Socket();
        socket.connect(server.port, server.ip, () => { });
        socket.on('error', function (err) {
            console.log(err)
            resolve(false)
        });
        socket.on('data', function (data) {
            if (data.toString().startsWith('Password:')) {
                socket.write(server.password)
                //console.log(data.toString())
            }
            if (data.toString().startsWith('Authenticated=1')) {
                console.log('Logged in!');
                (async () => {
                    socket.playerList = JSON.parse(await commandHandler(socket, 'RefreshList'))
                    resolve(socket);
                })();
                setInterval(function () {
                    (async () => {
                        socket.playerList = JSON.parse(await commandHandler(socket, 'RefreshList'))
                    })();
                }, 60000);
            }
            if (data.toString().startsWith('Authenticated=0')) {
                console.log('Login wrong!');
            }
        });
    });
}

function connect() {
    const port = 9100
    const host = 'localhost'
    client.connect(port, host, () => { })
}
