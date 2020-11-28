import React, {Component} from 'react';
import styles from './SpeechTest.css'
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'


//----------------------------------------
//         Speech Recognition
//----------------------------------------

const SpeechRecognition =  window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'en-US'


class Speech extends Component {
    constructor(){
        super()
        this.state = {
            listening: false,
            userResponse: '',
            allResponses: [],
            recommendations: [],
            toggleQuestion: false,
            questionList: ["Tell me about yourself.", "What are your strengths?", "What are your weaknesses?", "Tell me about a time you've worked with a team.",
                           "Tell me about a leadership experience you're proud of.", "Tell me about how your past coworkers would describe you."],
            currentQuestion: '',
            // userFeedback: [],
            finishedInterview: false,
            data: null,
            positions: null,
        }
        this.toggleListen = this.toggleListen.bind(this)
        this.generateQuestion = this.generateQuestion.bind(this)
        this.handleListen = this.handleListen.bind(this)
        this.provideFeedback = this.provideFeedback.bind(this)
    }

    /*

    const positionList = this.state.data["positions"]
    console.log(positionList)
    const school = this.state.data["schools"]
    console.log(school)
    var arrayLength = positionList.length;
    var tempQuestions = []
    for (var i = 0; i < positionList; i++) {
        const questionTemp = "How has your experience at " + positionList[i]["org"] + " helped you develop as a person?"
        const questionTemp2 = "What is your proudest project at " + postitionList[i]["org"] + "?"
        tempQuestions.push({questionTemp})
        tempQuestions.push({questionTemp2})
        
    }

    */
    generateQuestion() {
        /*
        const positionList = this.state.data["positions"]
        console.log(positionList)
        const school = this.state.data["schools"]
        console.log(school)
        const arrayLength = positionList.length;
        const tempQuestions = []
        console.log(arrayLength)
        for (var i = 0; i < arrayLength; i++) {
            const questionTemp = "How has your experience at " + positionList[i]["org"] + " helped you develop as a person?"
            const questionTemp2 = "What is your proudest project at " + positionList[i]["org"] + "?"
            const questionTemp3 = "What have you learned from " + positionList[i]["org"] + "?"
            const questionTemp4 = "Why have you left your position at " + positionList[i]["org"] + "?"
            const questionTemp5 = "Tell me more aboout your experience at " + positionList[i]["org"] + "?"
            tempQuestions.push({questionTemp})
            tempQuestions.push({questionTemp2})
            tempQuestions.push({questionTemp3})
            tempQuestions.push({questionTemp4})
            tempQuestions.push({questionTemp5})
        } 
        const questionTemp6 = "How has your experiences at "
        console.log(tempQuestions) */
        const min = 0;
        const max = this.state.questionList.length;
        const rand = Math.round(Math.random() * ((max - 1) - min));
        console.log(rand)
        const question = this.state.questionList[rand]
        //console.log(question)
        this.setState({
            toggleQuestion: true,
            currentQuestion: question,
        })
    }

    toggleListen() {
        this.setState({
            listening: !this.state.listening
        }, this.handleListen)
    }

    handleListen() {
        console.log('listening?', this.state.listening)

        if (this.state.listening) {
            this.generateQuestion();
            recognition.start()
            recognition.onend = () => {
                console.log("...continue listening...")
                recognition.start()
            }
        } else {
            recognition.stop()
            recognition.onend = () => {
                console.log("Stopped listening per click")
            }
        }

        recognition.onstart = () => {
            console.log("Listening!")
        }

        let finalTranscript = ''
        recognition.onresult = event => {
            let interimTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalTranscript += transcript + ' ';
                else interimTranscript += transcript;
            }
            this.setState({
                userResponse: finalTranscript,
            })
            document.getElementById('interim').innerHTML = interimTranscript
            document.getElementById('final').innerHTML = finalTranscript

            const transcriptArr = finalTranscript.split(' ')
            const stopCmd = transcriptArr.slice(-3, -1)
            console.log('stopCmd', stopCmd)

            if (stopCmd[0] === 'stop' && stopCmd[1] === 'listening'){
                recognition.stop()
                recognition.onend = () => {
                console.log('Stopped listening per command')
                const finalText = transcriptArr.slice(0, -3).join(' ')
                document.getElementById('final').innerHTML = finalText
                }
            }


        }

        recognition.onerror = event => {
            console.log("Error occurred in recognition: " + event.error)
        }

        if(!this.state.listening){
            // MAKE GET REQUEST TO NATHAN
            console.log("userAnswer")
            let userAnswer = {'transcript': this.state.userResponse, 'resume': this.state.data}
            console.log(userAnswer)

            let tempDict = {
                key: this.state.currentQuestion,
                value: this.state.userResponse, 
            }
            //{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postid_url_slug: postid, text: inputText }) }
            fetch('/api/v1/speechAnalysis/', {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({data: userAnswer})})
            .then((response) => {
                return response.json()
            })    
            .then((data) => {
                    console.log("Response")
                    console.log(data)
                    //if(!response.ok) throw Error(response.statusText);
                    // let userFeedbackTemp = this.state.userFeedback;
                    // userFeedbackTemp.push({
                    //     key: this.state.currentQuestion,
                    //     value: response,
                    // })
                    if(data){
                        tempDict['feedback'] = data
                        console.log(tempDict['feedback'])
                    } else{
                        tempDict['feedback'] = ''
                        console.log(tempDict['feedback'])
                    }

                    console.log("Adding to the reponses!")
                    let allResponsesTemp = this.state.allResponses
                    allResponsesTemp.push(tempDict)
                    this.setState({
                        allResponses: allResponsesTemp
                    })
                    console.log(this.state.allResponses)
                })
        }
    }

    provideFeedback(){
        console.log(this.state.finishedInterview)
        console.log(this.state.allResponses)
        console.log(this.state.userFeedback)
        this.setState({
            finishedInterview: true,
        }, () => console.log(this.state.finishedInterview))
        //console.log(this.state.finishedInterview)
    }

    onUploadHandler(event) {
        const file = event.target.files[0];
    
        // Simple POST request with a JSON body using fetch
        const formData = new FormData();
        formData.append('file', file);
        const requestOptions = {
          method: 'POST',
          body: formData,
        };
        console.log("Fetching")
        fetch('/parse', requestOptions)
          .then((response) => {
              //console.log(response.json())
              return response.json()})
          .then((resume) => {
              //console.log(resume)
            /*
            this.setState({ resume }#
            const degrees = resume.schools ? resume.schools.map((school) => `Degree: ${school.degree ?? '??'}. Major: ${school.field ?? '??'}.`) : [];
            const schools = resume.schools ? resume.schools.map((school) => `${school.org ?? '??'} from ${school.start ? school.start.month : '??'}/${school.start ? school.start.year : '??'} to ${school.end ? school.end.month : '??'}/${school.end ? school.end.year : '??'}.`) : [];
            const links = resume.links ? resume.links.map((link) => link.url ?? '??').join(', ') : [];
            const data = [
              { info: 'Name', parsed: resume.names ? resume.names.join(', ') : [] },
              { info: 'Email', parsed: resume.emails ? resume.emails[0].value : [] },
              { info: 'Phone', parsed: resume.phones ? resume.phones[0].value : [] },
              { info: 'University', parsed: schools.join(', ') },
              { info: 'Degree', parsed: degrees.join(', ') },
              { info: 'Links', parsed: links },
              { info: 'Summary', parsed: resume.summary && resume.summary.experience ? resume.summary.experience : '??' },
              { info: 'Skills', parsed: resume.summary && resume.summary.skills ? resume.summary.skills : '??' },
            ];
            const positions = resume.positions ? resume.positions.map((position) => ({
              company: position.org ?? '??', position: position.title ?? '??', date: `${position.start ? position.start.month : '??'}/${position.start ? position.start.year : '??'} - ${position.end ? position.end.month : '??'}/${position.end ? position.end.year : '??'}`, summary: position.summary ?? '??',
            })) : [];
            const limitedPositions = resume.positions ? resume.positions.map((position) => ({
              company: `${position.org} -- 
                ${position.title} (${position.start ? position.start.month : '??'}/${position.start ? position.start.year : '??'} - ${position.end ? position.end.month : '??'}/${position.end ? position.end.year : '??'}` ?? '??',
              summary: position.summary ?? '??',
            })) : [];
    
            this.setState({ data, positions, limitedPositions });
            console.log("data")
            console.log(this.state.data)
            console.log("positions")
            console.log(this.state.positions)
            console.log("limited poisitons")
            console.log(this.state.limitedPositions)
            */
           this.setState({data: resume})
           
          })
          .catch((error) => {
            console.log(error);
          });
      }
      
    render() {
        return (
            <div className='content'>
                <div className='headerContent'>
                    <h1 className='titleHeader'>Welcome to AInterview</h1>
                </div>
                <div className='pageContent'>
                    <div className='resumeContainer'>
                        <h1 className='titleHeader'>Instructions</h1>
                            <div className = 'instructions'>
                                <p>1. Submit your resume below</p>
                                <p>2. Click 'Generate Question' and start your interview</p>
                                <p>3. Once you have finished answering, click 'Stop'</p>
                                <p>4. Click 'Generate Question' again for another question</p>
                                <p>5. When you are finished, click 'Analyze Scores' to view feedback</p>
                            </div>
                        <h1 className='titleHeader'>Insert Resume</h1>
                        <form method="post" action="#" id="#">
                            <div className="form-group files">
                            <label for="file">Upload resume (docx or pdf):</label>
                            <input type="file" name="file" className="form-control" onChange={(event) => this.onUploadHandler(event)} />
                            </div>
                        </form>
                        
                        
                    </div>
                    <div className='interviewContainer'>
                        <h1 className='titleHeader'>Start Interviewing</h1>
                        {/*this.state.questionList.map((question) => <p>{question}</p>)*/}
                        <button id='microphone-btn' className='toggleButton' onClick={this.toggleListen}>{!this.state.listening ? "Generate Question" : "Stop"}</button>
                        {this.state.toggleQuestion && this.state.currentQuestion}
                        <div id='interim' className='interim'></div>
                        <div id='final' className='final'>
                            <p className='small-component'>Current Answer</p>
                            {this.state.userResponse}
                        </div>
                        <button id='done-btn' className='finishButton' onClick={this.provideFeedback}>Analyze Score</button>
                    </div>
                </div>
                {this.state.finishedInterview && <div className='feedback'>
                    <div className='feedbackHeaders'>
                        <div><h1 className='feedbackHeader'>Transcript</h1></div>
                        <div><h1 className='feedbackHeader'>Feedback</h1></div>
                    </div>
                    <div className='feedbackContent'>
                        { this.state.allResponses.map((response) => 
                        <div className="questionContent">
                            <div className="questionTranscript">
                                <p>Question: {response.key} </p>
                                <p>Answer:{response.value}</p>
                            </div>
                            <div className="questionFeedback">
                                <p>Company: {response.feedback.company}</p>
                                <p>{response.feedback.breakdown[0].category}: </p>
                                {response.feedback.breakdown[0].words.map((word) => 
                                    <p>{word}</p>
                                )}
                                <p>{response.feedback.breakdown[1].category}: {response.feedback.breakdown[1].value}</p>
                                <p>{response.feedback.breakdown[2].category}: {response.feedback.breakdown[2].value}</p>
                                <p>{response.feedback.breakdown[3].category}: {response.feedback.breakdown[3].value}</p>
                                <p>Speaking Score: {response.feedback.speaking_score}</p>
                            </div>
                        </div>) }
                    </div>

                </div>}
            </div>
        )
        
    }

}

export default Speech