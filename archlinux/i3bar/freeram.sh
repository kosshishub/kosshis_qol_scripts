echo $(awk '/^Mem/ {printf("FREE: %uMB", $7);}' <(free -m) || exit 1)
