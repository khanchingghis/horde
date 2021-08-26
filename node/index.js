const score = require('./score')
const logScraper = require('./logScraper')


async function initAsync(){
score.init()
    .then(x => console.log('Crashed:', x))
    .catch(e=>console.log('Crashed:', e))

    await sleep(1000)
    logScraper.watchLog()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

initAsync()
