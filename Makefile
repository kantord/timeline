./public/journal.json: ~/journal.txt
	jrnl --export json	> $@
