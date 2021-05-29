myip=$(curl icanhazip.com)
myipTxt=$(echo $myip | tr -d '.')
myCredsFileName=creds$myipTxt.txt
pavlovConfigDir="/home/steam/pavlovserver/Pavlov/Saved/Config"
MapMode=${1:-None}

echo "Updating Selector..."
mkdir -p $pavlovConfigDir/ModSave/
cp $pavlovConfigDir/RconSettings.txt $pavlovConfigDir/ModSave/$myCredsFileName
echo IP=$myip >> $pavlovConfigDir/ModSave/$myCredsFileName
echo Maps=$MapMode >> $pavlovConfigDir/ModSave/$myCredsFileName
echo "Updated Selector"