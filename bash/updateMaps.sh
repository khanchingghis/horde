#!/bin/bash

mapsLocalFolder="/home/steam/pavlovserver/Pavlov/Saved/maps/"
mapsLocalXML=$mapsLocalFolder"latestMaps.xml"
mapsRemoteXML="https://storage.googleapis.com/pavlov-common/"

curl $mapsRemoteXML > $mapsLocalXML
xmlstarlet sel -t -v //Contents this.xml