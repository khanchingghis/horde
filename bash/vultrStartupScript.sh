#!/bin/bash

localInstallDir="/root/"
localHordeDir=$localInstallDir"horde/"
hordeRepo="https://github.com/khanchingghis/horde"

echo "Downloading Repo..."
cd $localInstallDir
git clone $hordeRepo
chmod +rx -R $localHordeDir

echo "Installing Node..."
hordeNodeDir=$localHordeDir"/node"
cd $hordeNodeDir
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing Dependencies..."
npm i

echo "Getting initial settings..."
cd $hordeNodeDir
node makeSettings.js

echo "Installing Pavlov Server"

echo "Installing Horde Services"
