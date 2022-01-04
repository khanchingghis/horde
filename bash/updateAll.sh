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
    echo "Updating Repo..."
    cd $localHordeDir && git fetch origin master --depth=1 && git reset --hard origin/master
    chmod +rx -R $localHordeDir
fi

echo "Updating Maps..."
rclone sync :s3,endpoint=ewr1.vultrobjects.com:hordemaps/ $mapsLocalFolder
chmod +rx -R $mapsLocalFolder