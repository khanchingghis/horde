#!/bin/bash
#Monitors KDA


hordeNodeDir="/root/horde/node"
cd $hordeNodeDir
scorePath=$hordeNodeDir'/score.js'
npm i
node score.js
