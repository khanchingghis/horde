#!/bin/bash -e
#Saved in ~
gFormID="1FAIpQLSfBoKeQp27rP0AnZUguhBITjzEd4MPdfQYnYzP2k_TesDSKRg"
gSheetID="1XTOp2iFGMDvrDBgMfDc4HO88EDUMAzAEvSc45xNKTCc"
gPostURL="https://docs.google.com/forms/u/0/d/e/"$gFormID"/formResponse"
gameFile=$(sudo find /home/ -name "Game.ini" -print)
serverName=$(awk -F "=" '/ServerName/ {print $2}' $gameFile)
latestUrl="https://docs.google.com/spreadsheets/d/"$gSheetID"/gviz/tq?tq=select%20max(B)"
latestDate=$(curl -s $latestUrl | awk -F '(setResponse\\(|\\);)' '// {print $2}' | jq '.table.rows[0].c[0].v')
latestDateCheck=$(sed 's/[.-]//g' <<< $latestDate)
if echo $latestDateCheck | grep '[0-9]' >/dev/null; then latestTimeStamp="$latestDateCheck"; else latestTimeStamp="0"; fi;

awk -F '(LogNet:|name=| userId: NULL:| platform:)' '/userId/ {
    split($1,a,":");
    gsub(/\[/,"",a[1]);
    gsub(/<[0-9]> /,"",$3);
    url="https://docs.google.com/forms/u/0/d/e/'$gFormID'/formResponse";
    arg1="entry.25602537="a[1];
    arg2="entry.412058581="$3;
    arg3="entry.1196311754="$4;
    arg4="entry.218900039='"$serverName"'";
    dateCheck=gensub(/[-\.]/,"","g",a[1]);
    if ((dateCheck > '$latestTimeStamp')) {
        system("curl -s -o /dev/null --data-urlencode \"" arg1"\" --data-urlencode \"" arg2"\" --data-urlencode \"" arg3"\" --data-urlencode \"" arg4"\" '$gPostURL'");
        print(NR, a[1], $3, $4, "Sent");
        }
    else {
        print(NR, a[1], $3, $4, dateCheck, "Not Sent");
        }
    }' /home/steam/pavlovserver/Pavlov/Saved/Logs/*

