#!/bin/bash

localInstallDir="/root/"
localHordeDir=$localInstallDir"horde/"
localMapsDir=$localHordeDir"maps/"
hordeRepo="https://github.com/khanchingghis/horde"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"
localGameini="/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini"


echo "Checking for updates..."
cd $localHordeDir
git remote update
localCommit=$(git rev-parse @)
upstreamCommit=$(git rev-parse @{u})

if [ $localCommit == $upstreamCommit ]; then
    echo "No updates"
else
    ./bash/updateRepo.sh
fi

./bash/updateMapsRC.sh