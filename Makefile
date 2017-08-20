all: ./build/journal.json ./build/accounting.csv ./build/plate.json


./build/journal.json: ~/journal.txt
	jrnl --export json	> $@

./build/accounting.csv: ~/ledger-scripts/ledge.txt
	ledger -f $^ csv > $@

./build/plate.json: ~/.task/*
	echo "[" `task export` "]" > $@

./build/instagram.json: instagram.url
	cat $^ | xargs -L 1 curl -o $@
