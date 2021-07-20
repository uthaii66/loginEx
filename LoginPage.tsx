import React from 'react'
import { Redirect } from 'react-router-dom'

import './LoginPage.scss'
import loginPageIllustration from '../../assets/login_illustration.png'
import LoginForm from '../../containers/form/LoginForm/LoginForm'
import BrandLogo from '../../components/common/BrandLogo'
import SignupLink from '../../components/common/SignupLink'

const LoginPage: React.FC = () => {
  /* Redirecting user to dashboard page if already logged in */
  if (localStorage.getItem('accessToken')) {
    return <Redirect to="/onBoarding" />
  }

  return (
    <div className="login-page">
      <div className="left-content">
        <img alt="login illustration" draggable="false" src={loginPageIllustration} />
      </div>
      <div className="right-content">
        <div className="form-container">
          <BrandLogo />
          <h1 className="heading">Welcome Back</h1>
          <LoginForm />
          <p className="registration-seller">
            Don't have seller account ? <SignupLink />
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
