const score = require('./score')

score.init().then(x => console.log('Crashed:', x))