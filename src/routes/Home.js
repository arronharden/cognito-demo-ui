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
        </header>
      </div>
    )
  }
}

export default connect(mapStateToProps)(Home)
