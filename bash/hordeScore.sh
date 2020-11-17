#!/bin/bash
#Monitors and posts KDA updates

hordeNodeDir="/root/horde/node"
cd $hordeNodeDir
scorePath=$hordeNodeDir'/score.js'
npm i
node score.js