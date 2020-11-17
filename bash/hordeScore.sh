#!/bin/bash
#Monitors KDA


hordeNodeDir="/root/horde/node"
cd $hordeNodeDir
scorePath = $hordeNodeDir'/score.js'

curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y npm

node score.js
