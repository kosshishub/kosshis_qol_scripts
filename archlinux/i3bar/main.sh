#!/bin/sh
echo '{ "version": 1 }'
echo '['
echo '[]'
while :;
do

	bar=$(wget "localhost/i3status" -q -O -);
	
	if [ -z $bar ]
	then
		bar="[
			{
				\"name\":\"ERROR\",
				\"full_text\": \"Cant GET\",
				\"color\": \"#FF8888\"
			}			
		]"
	fi
	
	
	echo ", $bar";

	sleep 1
done
