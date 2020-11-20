const score = require('./score')

score.init()
    .then(x => console.log('Crashed:', x))
    .catch(e=>console.log('Crashed:', e))