const score = require('./score')
const logScraper = require('./logScraper')


async function initAsync(){
score.init()
    .then(x => console.log('Crashed:', x))
    .catch(e=>console.log('Crashed:', e))

logScraper.watchLog()
}

initAsync()
