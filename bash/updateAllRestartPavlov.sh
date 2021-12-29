#!/bin/bash

localInstallDir="/root/"
localHordeDir=$localInstallDir"horde/"
localMapsDir=$localHordeDir"maps/"
hordeRepo="https://github.com/khanchingghis/horde"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"
remoteGameini="https://docs.google.com/spreadsheets/d/${G_SHEET_ID}/export?format=csv"
localGameini="/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini"

echo "Stopping Pavlov Server..."
systemctl stop pavlov
cd $localHordeDir"bash/"
./updateAll.sh
echo "Starting Pavlov Server..."
systemctl start pavlov