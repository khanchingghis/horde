#!/bin/bash
#Changes value in game ini

CONFIG_FILE="/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini"
TARGET_KEY="MaxPlayers"
REPLACEMENT_VALUE="10"
echo "Editing $TARGET_KEY"

sed -i "s/\($TARGET_KEY *= *\).*/\1$REPLACEMENT_VALUE/" $CONFIG_FILE
