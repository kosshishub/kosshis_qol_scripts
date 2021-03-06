xrandr --newmode "1920x1080_72.00" 210.25 1920 2056 2256 2592 1080 1083 1088 1128 -hsync +vsync;
xrandr --addmode HDMI-A-0 "1920x1080_72.00";
xrandr --addmode HDMI-A-1 "1920x1080_72.00";

MODE=$(cat ~/script/xrandr/mode);
echo $MODE;

if [ $MODE -eq 2 ]; then
	echo "BOTH"
	xrandr 	--output HDMI-A-0 --mode "1920x1080_72.00" --pos 1920x0 \
			--output HDMI-A-1 --mode "1920x1080_72.00" --pos 0x0;
elif [ $MODE -eq 0 ]; then 
	echo "ONLY 0"
	xrandr 	--output HDMI-A-0 --mode "1920x1080_72.00" \
			--output HDMI-A-1 --off;
elif [ $MODE -eq 1 ]; then
	echo "ONLY 1"
	xrandr 	--output HDMI-A-0 --off \
			--output HDMI-A-1 --mode "1920x1080_72.00";
fi

