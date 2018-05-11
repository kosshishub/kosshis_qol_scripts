#!/bin/bash
free=$(free -m  | grep ^Mem | tr -s ' ' | cut -d ' ' -f 7)
total=$(free -m  | grep ^Mem | tr -s ' ' | cut -d ' ' -f 2)

let "used = total - free"

bar=$(~/script/i3bar/bar $free $total)

echo "$bar ${used}M"
# echo $total
# echo $free

