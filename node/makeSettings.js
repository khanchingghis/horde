const axios = require('axios')
const fs = require('fs')
const thisPath = __dirname

async function getInstanceUserData(){

    const res = await axios.default.get('http://169.254.169.254/latest/user-data')
    const userData = JSON.parse(JSON.stringify(res.data))
    const psqlOptionsPath = 'instanceUserData.json'
    const path = thisPath + `/${psqlOptionsPath}`
    fs.writeFileSync(path,userData)

}

getInstanceUserData()