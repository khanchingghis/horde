#!/bin/bash

localInstallDir="/root/"
localHordeDir=$localInstallDir"horde/"
localMapsDir=$localHordeDir"maps/"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"

    echo "Updating Maps..."
    cd $localMapsDir
    chmod +rx -R $localMapsDir
    unzip -q -o "*.zip" -d $mapsLocalFolder
    chmod +rx -R $mapsLocalFolder