#!/bin/bash
# Production startup script

# Install dependencies
pip install -r requirements.txt

# Start with Gunicorn (production WSGI server)
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app
