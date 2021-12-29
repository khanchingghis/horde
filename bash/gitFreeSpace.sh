#!/bin/bash

#Trims existing .git folder
git fetch --depth=1
git reflog expire --expire=all --all
git tag -l | xargs git tag -d
git stash drop
git gc --prune=all