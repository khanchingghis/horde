#!/bin/bash
#Monitors KDA

server_info(){
    echo "d90e38955deada86f5bca2d96b60086c" | nc localhost 9100
    echo "ServerInfo"
    nc 192.168.1.186 9760 <<END
        d90e38955deada86f5bca2d96b60086c
        ServerInfo
        END
}