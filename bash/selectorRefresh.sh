myip=$(curl icanhazip.com)
myipTxt=$(echo $myip | tr -d '.')
myCredsFileName=creds$myipTxt.txt
pavlovConfigDir="/home/steam/pavlovserver/Pavlov/Saved/Config"
isAll=${1:-True}

cp $pavlovConfigDir/RconSettings.txt $pavlovConfigDir/ModSave/$myCredsFileName
echo IP=$myip >> $pavlovConfigDir/ModSave/$myCredsFileName
echo All=$isAll >> $pavlovConfigDir/ModSave/$myCredsFileName
cp $pavlovConfigDir/LinuxServer/Game.ini $pavlovConfigDir/ModSave/Game.txt