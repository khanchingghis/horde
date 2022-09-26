#!/bin/bash

hordeRepo="https://github.com/khanchingghis/horde"
mkdir /root/temp
rm -rf /root/horde/.git
git clone $hordeRepo --depth=1 /root/temp/
mv /root/temp/.git /root/horde/.git
rm -rf /root/temp
