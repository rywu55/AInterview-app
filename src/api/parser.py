"""REST API for parser."""
import flask
import src
from flask import request
import requests
import json

@src.app.route('/api/parser/', methods=['POST'])
def parse_resume():
    print(request.form)
    resume = request.files['file']
    response = requests.post('https://jobs.lever.co/parseResume', files=dict(resume=resume))

    return response.json()



