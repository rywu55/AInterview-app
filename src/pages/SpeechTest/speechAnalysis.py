#import flask
import flair
from flair.models import SequenceTagger
#pip install flair

# app = Flask(__name__)
filler_words = [" well ", " um ", " er ", " uh ", " hmm ", " like ",
                " actually ", " basically ", " seriously ", " you see ",
                " you know ", " I mean ",
                " you know what I mean ",
                " at the end of the day ", " believe me ", " I guess ", " I suppose ",
                " or something ", " right ", " mhm ", " uh huh "]


# @app.route('/api/v1/speechAnalysis/', methods=["GET"])
# def speech_analysis():
#     data = flask.request.json
#     print(data)
#     transcript = data['transcript']
#     word_count = 0
#     for word in filler_words:
#         word_count += transcript.count(word)
#     print(word_count, "filler words were said")
#
#     flair_sentiment = flair.models.TextClassifier.load('en-sentiment')
#     sentiment = flair.data.Sentence(transcript)
#     flair_sentiment.predict(s)
#     total_sentiment = s.labels
#     print(total_sentiment)


def speech_analysis_demo():
    with open("demofile.txt", "r", encoding="cp1252") as f:
        for line in f:
            transcript = line.strip()
            word_count = {}
            for word in filler_words:
                word_count[word] = transcript.count(word)
            for word in filler_words:
                if word_count[word] != 0:
                    print("The phrase:", word, "was said", word_count[word], "times")
            flair_sentiment = flair.models.TextClassifier.load('en-sentiment')
            sentence = flair.data.Sentence(transcript)
            flair_sentiment.predict(sentence)
            total_sentiment = sentence.labels
            tagger = SequenceTagger.load('ner')
            tagger.predict(sentence)
            print(total_sentiment)
            for entity in sentence.get_spans('ner'):
                print(entity)
  #  f = open("demofile.txt", "r")
  #   transcript = f.readline()
  #   print(transcript)
  #   word_count = {}
  #   for word in filler_words:
  #       word_count[word] = transcript.count(word)
  #   for word in filler_words:
  #       if word_count[word] != 0:
  #           print("The phrase:", word, "was said", word_count[word], "times")
  #   flair_sentiment = flair.models.TextClassifier.load('en-sentiment')
  #   sentence = flair.data.Sentence(transcript)
  #   flair_sentiment.predict(sentence)
  #   total_sentiment = sentence.labels
  #   tagger = SequenceTagger.load('ner')
  #   tagger.predict(sentence)
  #   print(total_sentiment)
  #   for entity in sentence.get_spans('ner'):
  #       print(entity)

speech_analysis_demo()







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