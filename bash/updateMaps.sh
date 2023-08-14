#!/bin/bash

localInstallDir="/root/"
localHordeDir=$localInstallDir"horde/"
localMapsDir=$localHordeDir"maps/"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"

echo "Updating Maps..."
# rclone sync :s3,endpoint=ewr1.vultrobjects.com:hordemaps/ $mapsLocalFolder
rclone sync -P :"google cloud storage",anonymous=true,location=us-central1:hordemaps/ $mapsLocalFolder
chmod 777 -R $mapsLocalFolder