const score = require('./score')
const logScraper = require('./logScraper')


async function initAsync(){
score.init()
    .then(x =>{
        console.log('Closed:', x)
        process.exit()
    })
    .catch(e=>{
        console.log('Crashed:', e)
        process.exit()
    })

    await sleep(5000)
    logScraper.watchLog()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

initAsync()
