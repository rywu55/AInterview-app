import flask
import flair
import requests
import re
import csv
import os
import nltk
import gensim
import numpy as np

from nltk.tokenize import word_tokenize, sent_tokenize
# import bleu
import SpeechTest
from flair.models import SequenceTagger
# pip install flair
# https://github.com/neural-dialogue-metrics/BLEU

# app = Flask(__name__)
filler_words = ["well", " um ", " er ", " uh ", "hmm ", "like",
                "actually", "basically", "seriously", "you see",
                "you know", "I mean",
                "you know what I mean",
                "at the end of the day", "believe me", "I guess", "I suppose",
                "or something", "right", "mhm", "uh huh"]

action_verbs = ["orchestrated", "chaired", "programmed", "operated", "spear-headed", "collaborated", 
                "commissioned", "advised", "headed", "delegated", "established", "advocated", "fielded", 
                "consulted", "arbitrated", "mediated", "informed", "resolved", "interfaced", "updated", 
                "motivated", "explained", "guided", "facilitated", "clarified", "enabled", "capitalized", 
                "expedited", "stimulated", "maximized", "solved", "strengthened", "settled", "reconciled", 
                "elevated", "negotiated", "standardized", "implemented", "influenced", "arbitrated", "boosted", "clarified", 
                "integrated", "modified", "overhauled", "redesigned", "restructured", "transformed",
                "debugged", "regulated", "restored", "fabricated", "remodeled", "composed", "corresponded", 
                "illustrated", "persuaded", "lobbied", "defined", "formulated", "synthesized", "conveyed", 
                "disbursed", "publicized", "discussed", "informed", "eased", "adapted", "enhanced", "unified"]


@SpeechTest.app.route('/api/v1', methods=["GET"])
def show_index():
    return "HELLO WORLD"


@SpeechTest.app.route('/api/v1/speechAnalysis/', methods=["GET", "POST"])
def speech_analysis():
    """Get metrics and analysis of user transcript"""
    # ---------------------------------------------
    # Clean transcript text and set hyperparameters
    # ---------------------------------------------
    data = flask.request.get_json()['data']
    transcript = data['transcript']
    print(transcript)
    resume_summaries = data['resume']["positions"]
    # transcript = transcript.strip()
    # transcript = re.sub(r'[^a-zA-Z0-9]+', '', transcript)
    # transcript_string = transcript
    # transcript = transcript.split()

    utterance_length = len(transcript.split())
    wc_threshold = min(0.05*utterance_length, 2)
    lambda_f = 1
    lambda_s = 2
    lambda_r = 3
    lambda_v = 1

    # -----------------------
    # Get count of filler words
    # -----------------------
    word_count = {}
    for word in filler_words:
        word_count[word] = transcript.count(word)
        print(word, ": ", word_count[word])
    for word in filler_words:
        if word_count[word] != 0:
            print("The phrase:", word, "was said", word_count[word], "times")

    # ------------------------------------------------------------
    # Get positivity/negativity of each sentence and company names
    # ------------------------------------------------------------
    sentiment_score = 0
    companies = []
    flair_sentiment = flair.models.TextClassifier.load('en-sentiment')
    processed = flair.data.Sentence(transcript)  
    flair_sentiment.predict(processed)
    value = processed.labels[0].to_dict()['value'] 
    if value == 'POSITIVE':
        sentiment_score = processed.to_dict()['labels'][0]['confidence']
    else:
        sentiment_score = -(processed.to_dict()['labels'][0]['confidence'])
    tagger = SequenceTagger.load('ner')
    processed = flair.data.Sentence(transcript)  
    tagger.predict(processed)
    entities = processed.to_dict(tag_type='ner')
    for entity in entities["entities"]:
        companies.append(entity["text"])
    print("Sentiment Analysis:", sentiment_score)
    print("Named Entities:", companies)

    # --------------------------------------------------------
    # Use ranking algorithm to determine most relevant company
    # --------------------------------------------------------
    most_important = ""
    response = requests.get("https://www.parsehub.com/api/v2/projects/tRrJEnpDr-0S/last_ready_run/data?api_key=tkUoC2yLZ6pT&format=json")
    info = response.json()['internships']
    remove_idx = []
    temp = {}
    for i in range(len(info)):
        if len(info[i]) == 2:
            if info[i]['salary'][0] == "U":
                remove_idx.append(i)
            else:
                info[i]['salary'] = float(info[i]['salary'].split()[0][1:])
        else:
            remove_idx.append(i)
    for j in range(len(info)):
        if j not in remove_idx:
            temp[info[j]['company']] = info[j]['salary']
    info = list(temp.items())

    ranks = []
    if len(companies) == 0:
        most_important = ""
    else:
        for i in range(len(companies)):
            for j in range(len(info)):
                if companies[i] in info[j][0]:
                    ranks.append([companies[i], j])
        if len(ranks) == 0:
            most_important = companies[0]
        else:
            ranks.sort(key = lambda x : x[1])
            most_important = ranks[0][0]

    # ---------------------
    # Get action verb score
    # ---------------------
    verb_count = {}
    verb_counter = 0
    for word in action_verbs:
        verb_count[word] = transcript.count(word)
        print(word, ": ", verb_count[word])
    for word in action_verbs:
        if verb_count[word] != 0:
            verb_counter += verb_count[word]

    # -----------------------------
    # Get relevance to dataset score
    # -----------------------------
    nltk.download('punkt')
    gen_docs = []
    num_docs = 0
    filename = os.path.abspath(os.path.dirname(__file__)) + '/demofile.txt'
    with open(filename) as f:
        lines = f.readlines()
        for line in lines:
            line = line.replace(".", " ")
            line = [w.lower() for w in word_tokenize(line)]
            gen_docs.append(line)
            num_docs += 1

    dictionary = gensim.corpora.Dictionary(gen_docs)
    corpus = [dictionary.doc2bow(gen_doc) for gen_doc in gen_docs]

    tf_idf = gensim.models.TfidfModel(corpus)

    tmp = os.path.abspath(os.path.dirname(__file__)) + '/tmp/'
    sims = gensim.similarities.Similarity(tmp,tf_idf[corpus],
                                        num_features=len(dictionary))

    query_doc = [w.lower() for w in word_tokenize(transcript)]
    query_doc_bow = dictionary.doc2bow(query_doc)

    query_doc_tf_idf = tf_idf[query_doc_bow]

    sum_of_sims =(np.sum(sims[query_doc_tf_idf], dtype=np.float32))
    relevance_score = (sum_of_sims / num_docs)

    # --------------------------------------
    # Calculate user scoring for each metric
    # --------------------------------------
    context = {"company": most_important}
    word_violations = 0
    filler_used = []
    filler_occ = []
    for word in filler_words:
        if word_count[word] > wc_threshold:    
            word_violations += 1
            filler_used.append(word + " usage amount: " + str(word_count[word]))

    speaking_score = (lambda_s*sentiment_score) - (lambda_f*word_violations) + (lambda_v*verb_counter) + (lambda_r*relevance_score)
    context["speaking_score"] = speaking_score

    # ------------------
    # Format return JSON
    # ------------------
    breakdown = [{"category": "Filler Words", "words": filler_used}]
    breakdown.append({"category": "Sentiment", "value": sentiment_score})
    breakdown.append({"category": "Action Verbs", "value": verb_counter})
    breakdown.append({"category": "Response Relevance", "value": relevance_score})
    context["breakdown"] = breakdown
    print(context)
    return flask.jsonify(**context)



# RETURN
# [
#     company: string
#     speaking_score: float
#     breakdown: [
#                   { category: "Filler words", words: [string list] }, 
#                   { category: "Sentiment", value: float},
#                   { category: "Action Verbs", value: int}],
#                   { category: "Resume Relevance", value: float}
#                ]
# ]