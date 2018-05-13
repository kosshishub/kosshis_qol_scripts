Small messy script for tracking and downloading music off youtube playlists. Very unpolished, but it works.

Downloads in 128k .m4a (afaik best youtube can offer).

Keeps track of successful downloads per playlist, and won't try to download videos successfully downloaded before. The tracking file will be written on every finished download. You can kill the script at any time and it will handle it just fine.

Failed downloads will not be recorded to the track file, and will be reattempted every time you run the script in the hopes they're restored. Newly added videos will be downloaded.

By default runs 5 youtube-dl processes at the same time. You can increase this from the source.

Requirements:
- Linux
- Node.js
- youtube-dl (has to be callable from terminal)
- AtomicParsley (has to be callable from terminal)

Only tested on linux, making it run on windows should not be too difficult as long as it can call youtube-dl and AtomicParsley.

AtomicParsley is a dependency of Youtube-dl to write thumbnails to the .m4a files. The script only checks availability, doesn't itself use it.

Example Usage:
	node ytpl PLIz63zYvXCTbdE8BILXRwYHQJDbGj0CIK