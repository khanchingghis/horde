#!/bin/bash

localInstallDir="/root/"
localHordeDir=$localInstallDir"horde/"
localMapsDir=$localMapsDir"maps/"
hordeRepo="https://github.com/khanchingghis/horde"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"
remoteGameini="https://docs.google.com/spreadsheets/d/1xTNsaQoXIdYJWLzHBuojIwFnvSRKbVxxZqyrJ5Nr4xA/export?format=csv"
localGameini="/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini"

echo "Updating Repo..."
cd $localInstallDir
git clone $hordeRepo || cd $localHordeDir && git fetch origin master && git reset --hard origin/master
chmod +rx -R $localHordeDir

echo "Updating Maps..."
cd $localMapsDir
unzip -qq -o "*.zip" -d $mapsLocalFolder
chmod +rx -R $mapsLocalFolder

echo "Updating Game.ini..."
curl -L $remoteGameini > $localGameini
chmod +rx $localGameini
sed -i 's/""/-quote-/gi' $localGameini
sed -i 's/"//gi' $localGameini
sed -i 's/-quote-/"/gi' $localGameini