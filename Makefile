./public/journal.json: ~/journal.txt
	jrnl --export json	> $@

./public/accounting.csv: ~/ledger-scripts/ledge.txt
	ledger -f $^ csv > $@

./public/plate.json: ~/.task
	echo "[" `task export` "]" > $@
