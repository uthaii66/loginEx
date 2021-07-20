import React from 'react'
import { Button, TextField, Checkbox } from '@material-ui/core'
import { useForm } from 'react-hook-form'
import { Link, useHistory } from 'react-router-dom'

import { LoginService } from '../../../services/login.service'
import { ILoginResponse, ILoginError, ILoginCredentials } from '../../../services/interfaces/login.interface'
import { showNotification, STATUS } from '../../../common/constant'

import './LoginForm.scss'

type LoginCredentials = {
  email: string
  password: string
}

const formValidations = {
  email: {
    required: { value: true, message: '* Email field is empty' },
    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: '* Email format is invalid' }
  },
  password: {
    required: { value: true, message: '* Password field is empty' },
    minLength: { value: 6, message: '* Password must be at least 6 characters long' }
  }
}

const LoginForm: React.FC = () => {
  const loginService: LoginService = new LoginService()
  const history = useHistory<History>()
  const { register, handleSubmit, errors } = useForm<LoginCredentials>({ mode: 'onChange' })

  const onSubmit = async (data: ILoginCredentials) => {
    try {
      const loginResponse: ILoginResponse | ILoginError = await loginService.login({
        email: data.email,
        password: data.password
      })

      if (loginResponse.status === STATUS.SUCCESS) {
        const userDetails = loginResponse as ILoginResponse
        localStorage.setItem('accessToken', userDetails.data.accessToken)

        if (userDetails.data.isWizardCompleted) {
          history.push('/seller/dashboard')
        } else {
          history.push('/onBoarding')
        }
        showNotification(STATUS.SUCCESS, loginResponse.message)
      } else {
        showNotification('failure', loginResponse.message)
      }
    } catch (error) {
      showNotification('failure', error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        autoComplete="false"
        className="credential-fields"
        error={!!errors.email}
        helperText={errors.email ? errors.email.message : ''}
        inputRef={register(formValidations.email)}
        label="Email Address"
        name="email"
        size="small"
        variant="outlined"
      />
      <TextField
        autoComplete="false"
        className="credential-fields"
        error={!!errors.password}
        helperText={errors.password ? errors.password.message : ''}
        inputRef={register(formValidations.password)}
        label="Password"
        name="password"
        size="small"
        type="password"
        variant="outlined"
      />

      <div className="forgot-password-area">
        <div className="remember-password">
          <Checkbox />
          Remember password
        </div>
        <Link className="forgot-password" to="">
          Forgot Password
        </Link>
      </div>
      <Button className="btn-login" color="primary" type="submit" variant="contained">
        Login
      </Button>
    </form>
  )
}

export default LoginForm
