myip=$(curl icanhazip.com)
myipTxt=$(echo $myip | tr -d '.')
myCredsFileName=creds$myipTxt.txt
pavlovConfigDir="/home/steam/pavlovserver/Pavlov/Saved/Config"
MapMode=${1:-None}

mkdir -p $pavlovConfigDir/ModSave/
cp $pavlovConfigDir/RconSettings.txt $pavlovConfigDir/ModSave/$myCredsFileName
echo IP=$myip >> $pavlovConfigDir/ModSave/$myCredsFileName
echo Maps=$MapMode >> $pavlovConfigDir/ModSave/$myCredsFileName
cp $pavlovConfigDir/LinuxServer/Game.ini $pavlovConfigDir/ModSave/Game.txt
echo selector=$MapMode >> $pavlovConfigDir/ModSave/Game.txt
chmod +rwx $pavlovConfigDir/ModSave/$myCredsFileName
chmod +rwx $pavlovConfigDir/ModSave/Game.txt