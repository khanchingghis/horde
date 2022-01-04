#!/bin/bash

localInstallDir="/root/"
localHordeDir=$localInstallDir"horde/"
localMapsDir=$localMapsDir"maps/"
hordeRepo="https://github.com/khanchingghis/horde"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"
localGameini="/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini"

echo "Updating Repo..."
cd $localInstallDir
git clone $hordeRepo || cd $localHordeDir && git fetch origin master --depth=1 && git reset --hard origin/master
chmod +rx -R $localHordeDir