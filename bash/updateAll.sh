#!/bin/bash

localInstallDir="/root/"
localHordeDir=$localInstallDir"horde/"
localMapsDir=$localHordeDir"maps/"
hordeRepo="https://github.com/khanchingghis/horde"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"
localGameini="/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini"

localCommit=$(git rev-parse @)
upstreamCommit=$(git rev-parse @{u})

echo "Checking for updates..."
cd $localHordeDir
git fetch
if [ $localCommit == $upstreamCommit ]; then
    echo "No updates"
else
    echo "Updating Repo..."
    cd $localHordeDir && git fetch origin master && git reset --hard origin/master
    chmod +rx -R $localHordeDir

    echo "Updating Maps..."
    cd $localMapsDir
    unzip -qq -o "*.zip" -d $mapsLocalFolder
    chmod +rx -R $mapsLocalFolder
fi