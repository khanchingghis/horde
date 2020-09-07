#!/bin/bash

gFormID="1FAIpQLSfBoKeQp27rP0AnZUguhBITjzEd4MPdfQYnYzP2k_TesDSKRg"
gSheetID="1XTOp2iFGMDvrDBgMfDc4HO88EDUMAzAEvSc45xNKTCc"
gPostURL="https://docs.google.com/forms/u/0/d/e/"$gFormID"/formResponse"
gameFile=$(find /home/ -name "Game.ini" -print)
serverName=$(awk -F "=" '/ServerName/ {print $2}' $gameFile)

tail -f -n0 /home/steam/pavlovserver/Pavlov/Saved/Logs/Pavlov.log | gawk -F '(LogNet:|name=| userId: NULL:| platform:)' '/userId/ {
    split($1,a,":");
    gsub(/\[/,"",a[1]);
    gsub(/<[0-9]> /,"",$3);
    url="https://docs.google.com/forms/u/0/d/e/'$gFormID'/formResponse";
    arg1="entry.25602537="a[1];
    arg2="entry.412058581="$3;
    arg3="entry.1196311754="$4;
    arg4="entry.218900039='"$serverName"'";
    system("curl -s -o /dev/null --data-urlencode \"" arg1"\" --data-urlencode \"" arg2"\" --data-urlencode \"" arg3"\" --data-urlencode \"" arg4"\" '$gPostURL'");
    print(NR, a[1], $3, $4, "Sent");
    }'