#!/bin/bash

localInstallDir="/root"
localHordeDir=$localInstallDir"/horde"
hordeNodeDir=$localHordeDir"/node"
hordeBashDir=$localHordeDir"/bash"
hordeRepo="https://github.com/khanchingghis/horde"

echo "Downloading Repo..."
cd $localInstallDir
git clone $hordeRepo
chmod +rx -R $localHordeDir

echo "Installing Node..."
cd $hordeNodeDir
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing Node Dependencies..."
npm i

echo "Getting Settings and Installing Pavlov..."
cd $hordeNodeDir
node installPavlov.js

echo "Installing Horde Services..."
cd $hordeBashDir
./installServices.sh
systemctl restart systemd-journald.service
./installServices.sh
