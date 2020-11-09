#!/bin/bash

gFormID="1FAIpQLSexRKMLh1Cnhq_qXQ5qVvPQDDqiN8MyhGtm9e7OtfKVDB-LkA"
gPostURL="https://docs.google.com/forms/u/0/d/e/"$gFormID"/formResponse"
gameFile=$(sudo find /home/ -name "Game.ini" -print)
serverName=$(awk -F "=" '/ServerName/ {print $2}' $gameFile)
if echo $gameFile | grep '.ini' >/dev/null; then serverName="$serverName"; else serverName="Unknown"; fi;
myExternalIP=$(dig @resolver1.opendns.com ANY myip.opendns.com +short)
arg1="entry.260781218=$serverName"
arg2="entry.1378966823=$myExternalIP"
curl -s -o /dev/null --data-urlencode "$arg1" --data-urlencode "$arg2" $gPostURL > /dev/null