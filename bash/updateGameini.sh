#!/bin/bash

echo "updating Game.ini..."
curl -L "https://docs.google.com/spreadsheets/d/1xTNsaQoXIdYJWLzHBuojIwFnvSRKbVxxZqyrJ5Nr4xA/export?format=csv" > /home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini
