const axios = require('axios').default
const fs = require('fs')
const https = require('https');
const rcon = require('./rcon');

axios.defaults.timeout = 60000
axios.defaults.baseURL='https://api2.pavlovhorde.com:8003'


async function getServers() {
  let axios = require('axios');
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });

  const config = {
    method: 'get',
    url: '/getServers'
  };

  const response = await instance(config)
  const servers = response.data
  return servers
}

async function getMapsList(sha) {

  const downloadUrl = '/getMapsJSON'
  let axios = require('axios');

  const config = {
    method: 'get',
    url: `https://api.github.com/repos/khanchingghis/horde/git/trees/${sha}?recursive=1`,
  };

  const response = await axios(config)
  const tree = response.data.tree
  const maps = tree.filter(t=> t.path.indexOf('maps/') > -1)
  const mapsResult = maps.map(m => {

    const mapsObj = {
      'path':m.path,
      'size':m.size,
      'name':m.path.replace('maps/','').replace('.zip',''),
      'url':downloadUrl + m.path
    }
    return mapsObj
  })
  return mapsResult
}

async function getServersPC() {
  let axios = require('axios');
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });

  const config = {
    method: 'get',
    url: '/getServersPC'
  };

  const response = await instance(config)
  const servers = response.data
  return servers
}

async function getFullServerInfo(activeSocket){
  let serverInfo = await rcon.getServerInfo(activeSocket)
  const listInfo = await getServers()
  const serverList = listInfo.servers
  //server name for localhost ID
  const thisServerName = serverInfo.serverInfo.ServerInfo.ServerName
  const thisServer = serverList.find(x=>x.name == thisServerName)
  Object.assign(serverInfo.serverInfo.ServerInfo,thisServer)
  return serverInfo
}

module.exports = {getServers, getMapsList, getServersPC, getFullServerInfo}
