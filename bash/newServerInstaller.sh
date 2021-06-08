#!/bin/bash

INSTALL_USER="steam"

Install_Steam () {
    apt update && apt install -y gdb curl lib32gcc1 libc++-dev unzip
    useradd -m -d /home/$INSTALL_USER -s /bin/bash -U $INSTALL_USER
    runuser -l $INSTALL_USER -c 'mkdir ~/Steam && cd ~/Steam && curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -'
}
if [ -d "/home/${INSTALL_USER}/Steam" ]; then
  echo "Steam is already installed to /home/${INSTALL_USER}/Steam";
  else
  echo "Steam is not installed, installing now";Install_Steam
fi


Install_Server () {
    # read -p "Folder/Service Name [pavlovserver]: " FOLD_NAME;echo -e '\n';clear
    # FOLD_NAME=${FOLD_NAME:-pavlovserver}
    FOLD_NAME="pavlovserver"
    # read -p "Server Name [Horde]: " SERVER_NAME;echo -e '\n';clear
    # SERVER_NAME=${SERVER_NAME:-Horde}
    SERVER_NAME=$1
    # read -p "Max Players [8]: " SERVER_MAX_PLAYERS;echo -e '\n';clear
    # SERVER_MAX_PLAYERS=${SERVER_MAX_PLAYERS:-8}
    SERVER_MAX_PLAYERS=10
    # read -p "Game Port [7777]: " SERVER_PORT;echo -e '\n';clear
    # SERVER_PORT=${SERVER_PORT:-7777}
    SERVER_PORT=7777
    # read -p "Rcon Port [9100]: " RCON_PORT;echo -e '\n';clear
    # RCON_PORT=${RCON_PORT:-9100}
    RCON_PORT=9100
    # read -p "Rcon Password [H0RD3Legacy]: " RCON_PASS;echo -e '\n';clear
    # RCON_PASS=${RCON_PASS:-H0RD3}
    RCON_PASS=$2
    # read -p "Server Pin [Leave blank for no pin]: " SERVER_PIN;echo -e '\n';clear
    #           [ -z "$SERVER_PIN" ] && echo "No Pin selected" || SERVER_PIN="Password=\"$SERVER_PIN\""

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
# read -p "Is this correct? ${SERVER_PIN} (y/n)?" choice
# case "$choice" in 
#   y|Y ) echo 'Ok. Continuing..';;
#   n|N ) Install_Server;;
#   * ) echo "invalid";;
# esac

runuser -l $INSTALL_USER -c 'cd ~/Steam && ./steamcmd.sh +login anonymous +app_update 622970 -beta shack +exit && cp -r ~/Steam/steamapps/common/PavlovVRServer/* /home/'"$INSTALL_USER"'/'"$FOLD_NAME"'/;chmod +x ~/'"$FOLD_NAME"'/PavlovServer.sh;mkdir -p /home/'"$INSTALL_USER"'/'"$FOLD_NAME"'/Pavlov/Saved/Logs;mkdir -p /home/'"$INSTALL_USER"'/'"$FOLD_NAME"'/Pavlov/Saved/Config/LinuxServer;mkdir -p /home/'"$INSTALL_USER"'/'"$FOLD_NAME"'/Pavlov/Saved/maps/'


# MAPS_CLEAN=$( IFS=$'\n'; echo "${ARRAY[*]}" )
cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/LinuxServer/Game.ini <<EOL
[/Script/Pavlov.DedicatedServer]
ServerName="${SERVER_NAME}"
bEnabled=true
MaxPlayers=${SERVER_MAX_PLAYERS}
bSecured=true
bCustomServer=true 
bWhitelist=false
TimeLimit=20
MapRotation=(MapId="sand", GameMode="SND")
EOL

cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/mods.txt <<EOL
0024e335c394fc496e14c9447c13c5a # Chingghis
0020acb54484bae9f337d62b095816c # Chingghis2
Chingghis
EOL

cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/RconSettings.txt <<EOL
Password=${RCON_PASS}
Port=${RCON_PORT}
EOL

touch /home/steam/pavlovserver/Pavlov/Saved/Config/blacklist.txt
chmod o+rwx /home/steam/pavlovserver/Pavlov/Saved/Config/blacklist.txt

}

if [ $# -eq 0 ]; then
    echo -e "Usage: \n./pavlog.sh install\n./pavlog.sh update\n./pavlog.sh reconfigure\n"
    exit 1
  else
    Install_Server "$1" "$2"
fi
