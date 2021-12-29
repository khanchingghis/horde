#!/bin/bash
#Runs API Server

hordeNodeDir="/root/horde/node"
cd $hordeNodeDir
execPath=$hordeNodeDir'/apiServer.js'
node $execPath