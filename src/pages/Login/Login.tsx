import React, { useContext } from 'react'
import { userContext } from '../../context/userContext'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { Navigate } from 'react-router-dom'
import styles from './Login.module.css'
import useApi from '../../hooks/useApi'
import LoadPage from '../../components/LoadPage/LoadPage'

export interface ILoginProps {
    previousPage?: string
}

const validationSchema = yup.object({
    username: yup
        .string()
        .required('Username is required'),
    password: yup
        .string()
        .required('Password is required'),
  })

const Login: React.FC<ILoginProps> = ({previousPage}) => {
    const { user, setUser } = useContext(userContext)
    const { loading, fetch } = useApi()

    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validationSchema,
        onSubmit: values => {
            fetch('login', values, 'POST')
                .then(res => {
                    setUser(res.data)
                })
                .catch(e => {
                    console.log(e)
                    if (e.response && e.response.data && e.response.data.message) {
                        alert(e.response.data.message);
                    } else {
                        alert('Incorrect user or password');
                    }
                })
        }
    })

    if (user) {
        return <Navigate to={previousPage ? previousPage : '/'}/>
    }

    return (<><LoadPage loading={loading}/><form onSubmit={formik.handleSubmit} className={styles.form}>
        <h1>Login</h1>
        <div className='form-control'>
            <input 
                type={'text'} 
                name={'username'}
                placeholder='Username'
                value={formik.values.username} 
                onChange={formik.handleChange} 
                onBlur={formik.handleBlur}
                />
            {
                formik.touched.username && Boolean(formik.errors.username) &&
                <div className="error">{formik.errors.username}</div>
            }
        </div>
        <div className='form-control'>
            <input 
                type={'password'} 
                name={'password'}
                placeholder='Password'
                value={formik.values.password} 
                onChange={formik.handleChange} 
                onBlur={formik.handleBlur}
                />
            {
                formik.touched.password && Boolean(formik.errors.password) &&
                <div className="error">{formik.errors.password}</div>
            }
        </div>
        <div className='form-control'>
            <button type='submit' className='btn btn-primary'>Login</button>
        </div>
    </form></>)
}

export default Login