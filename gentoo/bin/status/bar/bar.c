#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char **argv) {

	if( argc != 3 ) {
		printf("Error: 2 arguments needed (free, total)");
		return 1;
	}

	int free = atoi(argv[1]);
	int total = atoi(argv[2]);

	float n = 1.0 - free/(float)total;
	int barw = 10;
	int barfill = barw*n+0.5;

	printf("[");
	for(int i = 0; i < barw; i++) printf( (barfill > i) ? "|" : "-" );
	printf("]\n");

	return 0;
}
