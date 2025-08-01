@echo off
REM Windows Production startup script

REM Install dependencies
pip install -r requirements.txt

REM Start with Gunicorn (production WSGI server)
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app
