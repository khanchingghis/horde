#!/bin/bash

hordeRepo="https://github.com/khanchingghis/horde"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"
remoteGameini="https://docs.google.com/spreadsheets/d/1xTNsaQoXIdYJWLzHBuojIwFnvSRKbVxxZqyrJ5Nr4xA/export?format=csv"
localGameini="/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini"

echo "Updating Maps..."
git clone $mapsRepo || git -C ./horde/ pull
cd ./horde/maps
unzip -o "*.zip" -d $mapsLocalFolder
chmod +x -R $mapsLocalFolder

echo "Updating Game.ini..."
curl -L $remoteGameini > $localGameini
