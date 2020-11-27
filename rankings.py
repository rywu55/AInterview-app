import requests
import re
import csv

#Company Salary Information Processing
#make API call to scraped data on Parsehub - Levels.fyi
response = requests.get("https://www.parsehub.com/api/v2/projects/tRrJEnpDr-0S/last_ready_run/data?api_key=tkUoC2yLZ6pT&format=json")
info = response.json()['internships']
#print(info)

#clean data - remove companies with no salary and string format salary
remove_idx = []
temp = {}
for i in range(len(info)):
    if len(info[i]) == 2:
        #print(info[i])
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
print(info)
def takeSecond(elem):
    return elem[1]
info = info.sort(key=takeSecond)
print(info)

#Job Salary Information Processing WIP
#make API call to scraped data on Parsehub - US News


#Industry Information Processing WIP
"""filename = "companies.csv"
with open(filename, 'r') as csvfile:
    csvreader = csv.reader(csvfile)
    #iterate past header
    header = next(csvreader)
    #iterate through rows
    count = 0
    for row in csvreader:
        if count < 10:
            print(row)
            company = row[0]
            industry = row[2]
            print(company)
            print(industry)
        count +=1
#Ranking Function
def ranker(companies):
    for i in range(len(companies)):
        if companies[i] in info"""
