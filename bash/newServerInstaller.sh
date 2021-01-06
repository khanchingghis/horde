#!/bin/bash

INSTALL_USER="steam"

Install_Steam () {
    apt update && apt install -y gdb curl lib32gcc1
    useradd -m -d /home/$INSTALL_USER -s /bin/bash -U $INSTALL_USER
    runuser -l $INSTALL_USER -c 'mkdir ~/Steam && cd ~/Steam && curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -'
}
if [ -d "/home/${INSTALL_USER}/Steam" ]; then
  echo "Steam is already installed to /home/${INSTALL_USER}/Steam";
  else
  echo "Steam is not installed, installing now";Install_Steam
fi


Install_Server () {
  clear
    read -p "Folder/Service Name [pavlovserver]: " FOLD_NAME;echo -e '\n';clear
    FOLD_NAME=${FOLD_NAME:-pavlovserver}
    read -p "Server Name [Horde]: " SERVER_NAME;echo -e '\n';clear
    SERVER_NAME=${SERVER_NAME:-Horde}
    read -p "Max Players [8]: " SERVER_MAX_PLAYERS;echo -e '\n';clear
    SERVER_MAX_PLAYERS=${SERVER_MAX_PLAYERS:-8}
    read -p "Game Port [7777]: " SERVER_PORT;echo -e '\n';clear
    SERVER_PORT=${SERVER_PORT:-7777}
    read -p "Rcon Port [9100]: " RCON_PORT;echo -e '\n';clear
    RCON_PORT=${RCON_PORT:-9100}
    read -p "Rcon Password [H0RD3Legacy]: " RCON_PASS;echo -e '\n';clear
    RCON_PASS=${RCON_PASS:-H0RD3}
    read -p "Server Pin [Leave blank for no pin]: " SERVER_PIN;echo -e '\n';clear
              [ -z "$SERVER_PIN" ] && echo "No Pin selected" || SERVER_PIN="Password=\"$SERVER_PIN\""

clear
config="
  Server/Folder:, ${FOLD_NAME}
  Game Port:, ${SERVER_PORT}

  Server Name:, ${SERVER_NAME}
  Max Players:, ${SERVER_MAX_PLAYERS}

  Rcon Port:, ${RCON_PORT}
  Rcon Password:, ${RCON_PASS}

  Server Pin:, ${SERVER_PIN}
  
  File Locations:, /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/LinuxServer/Game.ini, /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/RconSettings.txt, /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/mods.txt
  
"

echo "${config}"
read -p "Is this correct? ${SERVER_PIN} (y/n)?" choice
case "$choice" in 
  y|Y ) echo 'Ok. Continuing..';;
  n|N ) Install_Server;;
  * ) echo "invalid";;
esac
    runuser -l $INSTALL_USER -c 'cd ~/Steam && ./steamcmd.sh +login anonymous +force_install_dir /home/'"$INSTALL_USER"'/'"$FOLD_NAME"' +app_update 622970 -beta shack +exit;chmod +x ~/'"$FOLD_NAME"'/PavlovServer.sh;mkdir -p /home/'"$INSTALL_USER"'/'"$FOLD_NAME"'/Pavlov/Saved/Logs;mkdir -p /home/'"$INSTALL_USER"'/'"$FOLD_NAME"'/Pavlov/Saved/Config/LinuxServer'


MAPS_CLEAN=$( IFS=$'\n'; echo "${ARRAY[*]}" )
cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/LinuxServer/Game.ini <<EOL
[/Script/Pavlov.DedicatedServer]
ServerName="${SERVER_NAME}"
bEnabled=true
MaxPlayers=${SERVER_MAX_PLAYERS}
bSecured=true
bCustomServer=true 
bWhitelist=false
MapRotation=(MapId="sand", GameMode="SND")
EOL

cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/mods.txt <<EOL
0024e335c394fc496e14c9447c13c5a # Chingghis
002ddd4ebe4471bb16df13821d906fb # Byaxis
002b685d9b341ddb206356f0121528c # Jolo
002220b0a2c4071b105eab915813802 # JSM
002f983d86346d185ac4d869cfb831a # RazzleDazzle
0029e0f6f0c48a29ba276835f56c3be # Sebibi
0021e028b8f4457847ae755f084f543 # Noice
002274c9216485085b6fa2318b7f33a # kevpar
0021f4e7f834187ac73520c83f9b1a7 # lemon
002bed5c90e46109e2ca4fd64edddee # mentor
00280d2ccad4ef09fa9d456c2c60555 # kev2
002e63f6b98498288e19963520ca3eb # jolo2
0023ac822c14c7a8ccb3996651e1ebb # JSM2
0020acb54484bae9f337d62b095816c # Chingghis2
0020c83f9e24f90a3aadcc6af57e2ea # noice2
00251833c3844d780488d73cf532b77 # bert
002108014d44f93975c0bebf8888882 # orwxo
EOL

cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/RconSettings.txt <<EOL
Password=${RCON_PASS}
Port=${RCON_PORT}
EOL

touch /home/steam/pavlovserver/Pavlov/Saved/Config/blacklist.txt
chmod o+rwx /home/steam/pavlovserver/Pavlov/Saved/Config/blacklist.txt

}


Update_Server () {
TE=`ls /home/${INSTALL_USER}/ | sed 's/Steam//g' |  tr '\n' ' '`
PS3="Please select a server (/home/${INSTALL_USER}/): "
select server in ${TE}
do
    echo "Updating Server: $server"
    systemctl stop ${FOLD_NAME}
    runuser -l $INSTALL_USER -c /home/${INSTALL_USER}/Steam/steamcmd.sh +login anonymous +force_install_dir /home/${INSTALL_USER}/${server} +app_update 622970 -beta shack +exit


done
}



if [ $# -eq 0 ]; then
    echo -e "Usage: \n./pavlog.sh install\n./pavlog.sh update\n./pavlog.sh reconfigure\n"
    exit 1
fi

if [ $1 == "install" ]; then
echo "Starting Server install, foldername = servername"
  Install_Server
elif [ $1 == "update" ]; then
 Update_Server
else
  echo -e "Usage: \n./pavlog.sh install\n./pavlog.sh update\n./pavlog.sh configure\n"
  exit 1
fi