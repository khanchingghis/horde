#!/bin/bash
#Monitors and posts KDA updates

hordeNodeDir="/root/horde/node"
cd $hordeNodeDir
scorePath=$hordeNodeDir'/index.js'
npm i
node $scorePath