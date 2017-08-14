all: ./public/journal.json ./public/accounting.csv ./public/plate.json


./public/journal.json: ~/journal.txt
	jrnl --export json	> $@

./public/accounting.csv: ~/ledger-scripts/ledge.txt
	ledger -f $^ csv > $@

./public/plate.json: ~/.task
	echo "[" `task export` "]" > $@

./public/instagram.json: instagram.url
	cat $^ | xargs -L 1 curl -o $@
