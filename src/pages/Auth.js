import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {
  state = {
    isLogin: true
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    })
  }

  submitHandler = event => {
      event.preventDefault();
      const email = this.emailEl.current.value;
      const password = this.passwordEl.current.value;
      if(email.trim().length === 0 || password.trim().length === 0 ){
        return;
      }

      let requestquery = {
        query: `
        query Login($emailId: String!, $password: String!){
          login(email: $emailId, password: $password){
            userId
            tokenExpiration
            token
          }
        }
        `,
        variables: {
            emailId: email,
            password: password
        }
      };

      if (!this.state.isLogin) {
          requestquery = {
            query: `
              mutation CreateUser($emailId: String!, $password: String!){
                createUser(userInput: {email: $emailId, password: $password}) {
                  _id
                  email
                }
              }
            `,
            variables: {
                emailId: email,
                password: password
            }
          };
    }

      //...send the values to backend APIs
      fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestquery),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Auth Failed!!')
        }
        return res.json();
      })
      .then(resData => {
        if (resData.data.login.token) {
            this.context.login(
              resData.data.login.token,
              resData.data.login.userId,
              resData.data.login.tokenExpiration
            );
          }
      })
      .catch(err => {
        console.log(err);
      });
  };
  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-control">
          <label htmlFor="email">E-Mail</label>
          <input type="email" id="email" ref={this.emailEl} />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={this.passwordEl}/>
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" onClick={this.switchModeHandler}>Switch to {this.state.isLogin ? 'Signup' : 'Login'}</button>
        </div>
    </form>
  );
  }
}

export default AuthPage;
