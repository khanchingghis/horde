#!/bin/bash

remoteGameini="https://docs.google.com/spreadsheets/d/${G_SHEET_ID}/export?format=csv"
localGameini="/home/steam/pavlovserver/Pavlov/Saved/Config/LinuxServer/Game.ini"

systemctl stop pavlov
echo "Updating Game.ini..."
curl -L $remoteGameini > $localGameini
chmod +rx $localGameini
sed -i 's/""/-quote-/gi' $localGameini
sed -i 's/"//gi' $localGameini
sed -i 's/-quote-/"/gi' $localGameini
systemctl start pavlov