# Pavlov VR - Horde - Scripts

## Serverside

After following the [Dedicated Server Guide](http://wiki.pavlov-vr.com/index.php?title=Dedicated_server) to set up a custom Pavlov server, SSH into your server and run this to clone or update the repo:

```bash
rm -rf ./horde/ && git clone https://github.com/khanchingghis/horde.git
chmod +x ./horde/bash/postPlayers.sh ./horde/bash/postPlayersMonitor.sh ./horde/bash/postPlayersMonitorInstall.sh
sudo apt-get install jq
```

From there the following scripts can be run:

`./horde/bash/postPlayers.sh` - Reads Pavlov logs and posts a player connection log to [this Google Sheet](https://docs.google.com/spreadsheets/d/1XTOp2iFGMDvrDBgMfDc4HO88EDUMAzAEvSc45xNKTCc/). This can be run again to update the log with any new players since the last time you ran the script, as long as you have not changed the server name.

`sudo ./horde/bash/postPlayersMonitorInstall.sh` - Creates and enables a service that will post to [this Google Sheet](https://docs.google.com/spreadsheets/d/1XTOp2iFGMDvrDBgMfDc4HO88EDUMAzAEvSc45xNKTCc/) whenever a new player joins your server.

