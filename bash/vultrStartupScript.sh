#!/bin/bash

localInstallDir="/root"
localHordeDir=$localInstallDir"/horde"
hordeNodeDir=$localHordeDir"/node"
hordeBashDir=$localHordeDir"/bash"
hordeRepo="https://github.com/khanchingghis/horde"

sudo apt install ca-certificates
sudo apt update

echo "Downloading Repo..."
cd $localInstallDir
git clone $hordeRepo --depth=1
chmod +rx -R $localHordeDir

echo "Installing Node..."
cd $hordeNodeDir
sudo apt install -y nodejs
sudo apt install -y npm

echo "Installing Node Dependencies..."
npm i

echo "Getting Settings and Installing Pavlov and Services..."
cd $hordeNodeDir
node installPavlov.js