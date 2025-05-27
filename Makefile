venv:
	python3 -m venv venv

install: venv
	. venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

freeze:
	. venv/bin/activate && pip freeze > requirements.txt

run:
	. venv/bin/activate && python app.py 