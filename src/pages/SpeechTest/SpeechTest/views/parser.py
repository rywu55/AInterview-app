"""REST API for likes."""
import flask
import SpeechTest
import requests
from flask import request

@SpeechTest.app.route('/parse', methods=["GET", "POST"])
def parse_resume():
    resume = request.files['file']
    response = requests.post('https://jobs.lever.co/parseResume', files=dict(resume=resume))
    return response.json()