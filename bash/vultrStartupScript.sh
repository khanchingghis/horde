#!/bin/bash

localInstallDir="/root"
localHordeDir=$localInstallDir"/horde"
hordeNodeDir=$localHordeDir"/node"
hordeBashDir=$localHordeDir"/bash"
hordeRepo="https://github.com/khanchingghis/horde"

echo "Installing RClone..."
curl https://rclone.org/install.sh | sudo bash

echo "Downloading Repo..."
cd $localInstallDir
git clone $hordeRepo
chmod +rx -R $localHordeDir

echo "Installing Node..."
cd $hordeNodeDir
# curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt install -y nodejs
sudo apt install -y npm

echo "Installing Node Dependencies..."
npm i

echo "Getting Settings and Installing Pavlov and Services..."
cd $hordeNodeDir
node installPavlov.js