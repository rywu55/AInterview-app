"""REST API for likes."""
import flask
from flask import request

@app.route('/parse', methods=['POST'])
def parse_resume():
    print(request.form)
    resume = request.files['file']
    
    response = requests.post('https://jobs.lever.co/parseResume', files=dict(resume=resume))
    return response.json()