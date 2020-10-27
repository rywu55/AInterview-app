import flask
import flair
#pip install flair

app = Flask(__name__)
filler_words = ["well", "um", "er", "uh", "hmm", "like", "actually", "basically", "seriously", "you see", "you know", "I mean", "you know what I mean", "at the end of the day", "believe me", "I guess", "I suppose", "or something", "right", "mhm", "uh huh"]


@app.route('/api/v1/speechAnalysis/', methods=["GET"])
def speech_analysis():
    data = flask.request.json
    print(data)
    transcript = data['transcript']
    word_count = 0
    for word in filler_words:
        word_count += transcript.count(word)
    print(word_count, "filler words were said")
    
    flair_sentiment = flair.models.TextClassifier.load('en-sentiment')
    sentiment = flair.data.Sentence(transcript
    flair_sentiment.predict(s)
    total_sentiment = s.labels
    print(total_sentiment)



# RETURN
# [
#     {
#         category: "Filler words"
#         value: "9"
#         description: "You were pretty good but said 'like' 36 times you idiot"
#     },
#     {
#         category: "Action Verb Usage"
#         value: "5"
#         description: "You were pretty good but said 'like' 36 times you idiot"
#     },
#     {
#         category: "Sentiment"
#         value: "7"
#         description: "You were pretty good but said 'like' 36 times you idiot"
#     }
# ]