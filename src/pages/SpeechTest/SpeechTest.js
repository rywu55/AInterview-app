import React, {Component} from 'react';
import styles from './SpeechTest.css'
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'


//----------------------------------------
//         Speech Recognition
//----------------------------------------

// const SpeechRecognition = SpeechRecognition || window.webkitSpeechRecognition
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
        }
        this.toggleListen = this.toggleListen.bind(this)
        this.handleListen = this.handleListen.bind(this)
    }

    toggleListen() {
        this.setState({
            listening: !this.state.listening
        }, this.handleListen)
    }

    handleListen() {
        console.log('listening?', this.state.listening)

        if (this.state.listening) {
        recognition.start()
        recognition.onend = () => {
            console.log("...continue listening...")
            recognition.start()
        }

        } else {
        this.setState({
            allResponses: this.state.allResponses.concat(this.state.userResponse),
        })
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
    }

    analyzeScore() {
        const url = '/api/v1/speechAnalysis/';
        fetch(url, {
            credentials: 'same-origin',
            method: 'GET',
            body: JSON.stringify({ transcript: this.state.allResponses }),
            headers: { 'Content-Type': 'application/json' },
        })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            console.log(data);
            this.setState({
                recommendation: data.totalSentiment,
            });
        })

    }

    render() {
        return (
            <div className='container'>
                <h1>AInterview</h1>
                <button id='microphone-btn' className='toggleButton' onClick={this.toggleListen} />
                <div id='interim' className='interim'></div>
                <div id='final' className='final'></div>
                <div className='final'>
                    <p>Current Answer</p>
                    {this.state.userResponse}
                </div>
                <div className='final'>
                    <p>All Answers</p>
                    {this.state.allResponses.map((response)=> (
                        <p>{response}</p>
                    ))}
                </div>
                <button id='done-btn' className='finishButton' onClick={this.analyzeScore} />
                <div className='final'>
                    <h2>How to Improve!</h2>
                    {this.state.recommendations.map((recommendation) => {
                        // <div>
                        //     <p>{recommendation.category}</p>
                        //     <p>{recommendation.value}</p>
                        //     <p>{recommendation.description}</p>
                        // </div>
                    })}
                </div>

            </div>
        )
    }

}


export default Speech