import React from 'react';
import PropTypes from 'prop-types';

class Parser extends React.Component {

    constructor(props) {
        super(props)

        this.state = {

        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }
    //POST https://rest.bullhornstaffing.com/rest-services/{corpToken}/resume/parseToCandidate?format=DOC

    handleSubmit() {
        //fetch api call to time
        console.log('hi made it here')

        /*
                fetch('/api/parser/')
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                    })
                    .catch(error => console.log('error')) */
    }
    render() {
        return (
            <div>
                <h1>Insert resume</h1>
                <form action="/parse" method="post" encType="multipart/form-data">
                    <input type="file" name="file"></input>
                    <input type="submit" name="update" value="submit" />
                </form>
            </div>
        )
    }
}

export default Parser