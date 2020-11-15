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
    RCON_PASS=${RCON_PASS:-H0RD3Legacy}
    read -p "Server Pin [Leave blank for no pin]: " SERVER_PIN;echo -e '\n';clear
              [ -z "$SERVER_PIN" ] && echo "No Pin selected" || SERVER_PIN="Password=\"$SERVER_PIN\""

get_maps () {
clear
read -p "Map(s) [UGC12314124,TDM UGC12312312,SND]: " SERVER_MAPS

map_arr=($SERVER_MAPS)
ARRAY=()
for i in "${map_arr[@]}"; do :
IFS=, read var1 var2 <<< $i
  echo "MapRotation=(MapId=\"$var1\", GameMode=\"$var2\")"
  ARRAY+=("MapRotation=(MapId=\"$var1\", GameMode=\"$var2\")")
done
if [ ${#ARRAY[@]} -eq 0 ]; then 
echo "No maps entered, or maps were entered incorrectly"
get_maps
fi
}

read -p "Admins(s) [76561198017260467 76822158017823567]: " SERVER_ADMINS; clear

get_maps

clear
config="
  Server/Folder:, ${FOLD_NAME}
  Game Port:, ${SERVER_PORT}

  Server Name:, ${SERVER_NAME}
  Max Players:, ${SERVER_MAX_PLAYERS}
  Map Rotation:, ${SERVER_MAPS}

  Rcon Port:, ${RCON_PORT}
  Rcon Password:, ${RCON_PASS}

  Server Pin:, ${SERVER_PIN}
  Server Admins:, ${SERVER_ADMINS}
  
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
bEnabled=true
ServerName="${SERVERNAME}"
MaxPlayers=${SERVER_MAX_PLAYERS}
bSecured=true
bCustomServer=true 
bWhitelist=false 
${MAPS_CLEAN}
${SERVER_PIN}
EOL

ADMINS_CLEAN=`echo ${SERVER_ADMINS} | tr ' ' '\n'`
cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/mods.txt <<EOL
${ADMINS_CLEAN}
EOL

cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/RconSettings.txt <<EOL
Password=${RCON_PASS}
Port=${RCON_PORT}
EOL

Install_Service () {
    FOLD_NAME=$1
    SERVER_PORT=$2
cat >/etc/systemd/system/${FOLD_NAME}.service <<EOL
[Unit]
Description=Pavlov VR dedicated server

[Service]
Type=simple
WorkingDirectory=/home/${INSTALL_USER}/${FOLD_NAME}
ExecStart=/home/${INSTALL_USER}/${FOLD_NAME}/PavlovServer.sh -PORT=${SERVER_PORT}
RestartSec=1
Restart=always
User=${INSTALL_USER}
Group=${INSTALL_USER}

[Install]
WantedBy = multi-user.target
EOL
clear
read -p "Enable Service on startup? (y/n)?" choice
case "$choice" in 
  y|Y ) systemctl enable ${FOLD_NAME};;
  n|N ) echo "no";;
  * ) echo "invalid";;
esac
clear
read -p "Start Server and close script? (y/n)?" choice
case "$choice" in 
  y|Y ) systemctl start ${FOLD_NAME};;
  n|N ) echo "Closing..";exit 1;;
  * ) echo "invalid";;
esac


config="
  Server/Folder:, ${FOLD_NAME}
  Game Port:, ${SERVER_PORT}

  Server Name:, ${SERVER_NAME}
  Max Players:, ${SERVER_MAX_PLAYERS}
  Map Rotation:, ${SERVER_MAPS}

  Rcon Port:, ${RCON_PORT}
  Rcon Password:, ${RCON_PASS}

  Server Pin:, ${SERVER_PIN}
  Server Admins:, ${SERVER_ADMINS}
  
  File Locations:, /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/LinuxServer/Game.ini, /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/RconSettings.txt, /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/mods.txt
  
"
echo "${config}"
echo 'Finished'

}
Install_Service $INSTALl_USER $FOLD_NAME $SERVER_PORT

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







configure_server () {
#Stop server, use lines from install function CHOOSE SERVER
   
  #SELECT FOLDER
  FOLD_NAME=''
TE=`ls /home/${INSTALL_USER}/ | sed 's/Steam//g' |  tr '\n' ' '`
clear
PS3="Please select a server (/home/${INSTALL_USER}/): "
select server in ${TE}
do
    echo "Reconfiguring Server: $server"
    FOLD_NAME=${server}
    systemctl stop ${FOLD_NAME}
    break;
done;
  clear
    read -p "Server Name [Horde]: " SERVER_NAME;echo -e '\n';clear
    SERVER_NAME=${SERVER_NAME:-Horde}
    read -p "Max Players [8]: " SERVER_MAX_PLAYERS;echo -e '\n';clear
    SERVER_MAX_PLAYERS=${SERVER_MAX_PLAYERS:-8}
    read -p "Game Port [7777]: " SERVER_PORT;echo -e '\n';clear
    SERVER_PORT=${SERVER_PORT:-7777}
    read -p "Rcon Port [9100]: " RCON_PORT;echo -e '\n';clear
    RCON_PORT=${RCON_PORT:-9100}
    read -p "Rcon Password [H0RD3Legacy]: " RCON_PASS;echo -e '\n';clear
    RCON_PASS=${RCON_PASS:-H0RD3Legacy}
    read -p "Server Pin [Leave blank for no pin]: " SERVER_PIN;echo -e '\n';clear
              [ -z "$SERVER_PIN" ] && echo "No Pin Selected" || SERVER_PIN="Password=\"$SERVER_PIN\""

get_maps () {
  clear
read -p "Map(s) [UGC12314124,TDM UGC12312312,SND]: " SERVER_MAPS
map_arr=($SERVER_MAPS)
ARRAY=()
for i in "${map_arr[@]}"; do :
IFS=, read var1 var2 <<< $i
  echo "MapRotation=(MapId=\"$var1\", GameMode=\"$var2\")"
  ARRAY+=("MapRotation=(MapId=\"$var1\", GameMode=\"$var2\")")
done
if [ ${#ARRAY[@]} -eq 0 ]; then 
echo "No maps entered, or maps were entered incorrectly"
get_maps
fi
}
clear
read -p "Admins(s) [76561198017260467 76822158017823567]: " SERVER_ADMINS

get_maps

MAPS_CLEAN=$( IFS=$'\n'; echo "${ARRAY[*]}" )
cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/LinuxServer/Game.ini <<EOL
[/Script/Pavlov.DedicatedServer]
bEnabled=true
ServerName="${SERVERNAME}"
MaxPlayers=${SERVER_MAX_PLAYERS}
bSecured=true
bCustomServer=true 
bWhitelist=false 
${MAPS_CLEAN}
${SERVER_PIN}
EOL

ADMINS_CLEAN=`echo ${SERVER_ADMINS} | tr ' ' '\n'`
echo $ADMINS_CLEAN
cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/mods.txt <<EOL
${ADMINS_CLEAN}
EOL

cat >/home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/RconSettings.txt <<EOL
Password=${RCON_PASS}
Port=${RCON_PORT}
EOL

config="
  Server/Folder:, ${FOLD_NAME}
  Game Port:, ${SERVER_PORT}

  Server Name:, ${SERVER_NAME}
  Max Players:, ${SERVER_MAX_PLAYERS}
  Map Rotation:, ${SERVER_MAPS}

  Rcon Port:, ${RCON_PORT}
  Rcon Password:, ${RCON_PASS}

  Server Pin:, ${SERVER_PIN}
  Server Admins:, ${SERVER_ADMINS}

  File Locations:, /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/LinuxServer/Game.ini, /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/RconSettings.txt, /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/mods.txt

"

echo "${config}"
  systemctl start ${FOLD_NAME}
  echo "Reconfigure Done:"
  cat /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/LinuxServer/Game.ini;echo;echo
  cat /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/RconSettings.txt;echo;echo
  cat /home/${INSTALL_USER}/${FOLD_NAME}/Pavlov/Saved/Config/mods.txt;echo;echo
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
elif [ $1 == "reconfigure" ]; then
  configure_server
else
  echo -e "Usage: \n./pavlog.sh install\n./pavlog.sh update\n./pavlog.sh configure\n"
  exit 1
fi