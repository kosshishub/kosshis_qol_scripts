#!/bin/sh

# This script pulls all the random stuff all over my system to this folder.
# You can consult this file for correct path and filename information

cp -v	~/.Xresources 				./Xresources
cp -v	~/.config/compton.conf 		./compton.conf
cp -rv	~/.config/i3 				.
cp -rv	~/script/i3bar/ 			.