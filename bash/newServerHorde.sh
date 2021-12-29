#!/bin/bash

localInstallDir="/root/"
localHordeDir=$localInstallDir"horde/"
localMapsDir=$localMapsDir"maps/"
hordeRepo="https://github.com/khanchingghis/horde"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"
localGameini="/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini"

echo "Getting Repo..."
cd $localInstallDir
git clone $hordeRepo || cd $localHordeDir && git fetch origin master && git reset --hard origin/master
chmod +rx -R $localHordeDir

echo "Installing Node..."
hordeNodeDir="/root/horde/node"
cd $hordeNodeDir
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y npm

echo "Setting Up Server..."
bashDir=$localHordeDir"bash/"
cd $bashDir
./newServerInstaller.sh install
