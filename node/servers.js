const axios = require('axios')
const fs = require('fs')
const https = require('https');
const rcon = require('./rcon');

async function getServers() {
  let axios = require('axios');
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });


  const config = {
    method: 'post',
    url: 'https://shack-ms.vankrupt.com/servers/v1/list',
    headers: {
      'version': '0.80.60',
      'shack': '1',
      'User-Agent': 'Pavlov VR Game Client',
      'Content-Type': 'text/json',
      'Content-Length': '3',
      'Accept-Encoding': 'deflate, gzip'
    },
    data: "{ }",
  };

  const response = await instance(config)
  const servers = response.data
  return servers
}

async function getMapsList(sha) {

  const downloadUrl = 'https://github.com/khanchingghis/horde/raw/master/'
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
    url: 'http://ms.pavlov-vr.com/v1/servers',
    headers: {
      'version': '0.70.4'
    }
  };

  const response = await instance(config)
  const servers = response.data
  return servers
}

async function getFullServerInfo(server){
  let serverInfo = await rcon.getServerInfo(server)
  const listInfo = await getServers()
  const serverList = listInfo.servers
  //server name for localhost ID
  const thisServerName = serverInfo.serverInfo.ServerInfo.ServerName
  const thisServer = serverList.find(x=>x.name == thisServerName)
  Object.assign(serverInfo.serverInfo.ServerInfo,thisServer)
  return serverInfo
}

module.exports = {getServers, getMapsList, getServersPC, getFullServerInfo}
