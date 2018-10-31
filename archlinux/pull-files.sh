#!/bin/sh

# This script pulls all the random stuff all over my system to this folder.
# You can consult this file for correct path and filename information

cp -v	~/.Xresources 				.
cp -v	~/.config/compton.conf 		.
cp -v	~/.vimrc					.

cp -v	~/.bashrc					.

# Fixes audio for eg. some games
cp -v	~/.asoundrc					.

cp -v	/usr/share/vim/vim81/colors/noctu.vim .


cp -rv	~/.config/i3 				.
cp -rv	~/script/i3bar/ 			.
cp -rv  ~/script/xrandr/			.
