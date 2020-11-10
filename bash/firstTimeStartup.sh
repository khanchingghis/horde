#!/bin/bash

hordeRepo="https://github.com/khanchingghis/horde"
mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"

git clone $mapsRepo || git -C ./horde/ pull
cd ./horde/maps
unzip -o "*.zip" -d $mapsLocalFolder
chmod +x -R $mapsLocalFolder
