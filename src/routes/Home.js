import React, { Component } from 'react'
import logo from './logo.svg'
import './Home.css'
import { connect } from 'react-redux'
import cognitoUtils from '../lib/cognitoUtils'
import request from 'request'
import appConfig from '../config/app-config.json'

const mapStateToProps = state => {
  return { session: state.session }
}

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = { apiStatus: 'Not called' }
  }

  componentDidMount () {
    if (this.props.session.isLoggedIn) {
      // Call the API server GET /users endpoint with our JWT access token
      const options = {
        url: `${appConfig.apiUri}/users`,
        headers: {
          Authorization: `Bearer ${this.props.session.credentials.accessToken}`
        }
      }

      this.setState({ apiStatus: 'Loading...' })
      request.get(options, (err, resp, body) => {
        let apiStatus, apiResponse
        if (err) {
          // is API server started and reachable?
          apiStatus = 'Unable to reach API'
          console.error(apiStatus + ': ' + err)
        } else if (resp.statusCode !== 200) {
          // API returned an error
          apiStatus = 'Error response received'
          apiResponse = body
          console.error(apiStatus + ': ' + JSON.stringify(resp))
        } else {
          apiStatus = 'Successful response received.'
          apiResponse = body
        }
        this.setState({ apiStatus, apiResponse })
      })
    }
  }

  onSignOut = (e) => {
    e.preventDefault()
    cognitoUtils.signOutCognitoSession()
  }

  render () {
    return (
      <div className="Home">
        <header className="Home-header">
          <img src={logo} className="Home-logo" alt="logo" />
          { this.props.session.isLoggedIn ? (
            <div>
              <p>You are logged in as user {this.props.session.user.userName} ({this.props.session.user.email}).</p>
              <p></p>
              <div>
                <div>API status: {this.state.apiStatus}</div>
                <div className="Home-api-response">{this.state.apiResponse}</div>
              </div>
              <p></p>
              <a className="Home-link" href="#" onClick={this.onSignOut}>Sign out</a>
            </div>
          ) : (
            <div>
              <p>You are not logged in.</p>
              <a className="Home-link" href={cognitoUtils.getCognitoSignInUri()}>Sign in</a>
            </div>
          )}
          <div className="Home-details">
            <hr></hr>
            <div className="Home-details-links">
              This example application was written by Arron Harden and shows how to integrate AWS Cognito with a React single-page application and how to use Cognito issued JWT access codes to secure backend Express based Node.js REST APIs.
              More information about me can be found on my profile at <a href="https://arronharden.com">https://arronharden.com</a>.
              <p></p>
              See my medium.com posts for more information:
              <ul>
                <li><a href="https://medium.com/@arron.harden/aws-cognito-example-using-react-ui-and-node-js-rest-apis-part-1-cognito-setup-5597acb02db4">AWS Cognito example using React UI and Node.js REST APIs — part 1 (Cognito setup)</a></li>
                <li><a href="https://medium.com/@arron.harden/aws-cognito-example-using-react-ui-and-node-js-rest-apis-part-2-react-ui-app-with-redux-6cc22610affe">AWS Cognito example using React UI and Node.js REST APIs — part 2 (React UI app with Redux)</a></li>
                <li><a href="https://medium.com/@arron.harden/aws-cognito-example-using-react-ui-and-node-js-rest-apis-part-3-jwt-secured-rest-apis-e56d336ce306">AWS Cognito example using React UI and Node.js REST APIs — part 3 (JWT secured REST APIs)</a></li>
              </ul>
              Source is available in GitHub:
              <ul>
                <li><a href="https://github.com/arronharden/cognito-demo-ui">cognito-demo-ui</a></li>
                <li><a href="https://github.com/arronharden/cognito-demo-service">cognito-demo-service</a></li>
              </ul>
            </div>
          </div>
        </header>
      </div>
    )
  }
}

export default connect(mapStateToProps)(Home)
