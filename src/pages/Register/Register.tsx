import React, { useContext } from 'react'
import { userContext } from '../../context/userContext'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { Navigate } from 'react-router-dom'
import styles from './Register.module.css'
import useApi from '../../hooks/useApi'
import LoadPage from '../../components/LoadPage/LoadPage'

export interface IRegisterProps {
    previousPage?: string
}

const validationSchema = yup.object({
    username: yup
          .string()
          .required('Username is required'),
    password: yup
              .string()
              .required('Password is required'),
    password_repeat: yup
              .string()
              .required('You must repeat password')
              .oneOf([yup.ref('password'), null], 'Passwords are not the same')
})

const Register: React.FC<IRegisterProps> = ({previousPage}) => {
    const { user, setUser } = useContext(userContext)
    const { loading, fetch } = useApi()

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
            password_repeat: ''
        },
        validationSchema,
        onSubmit: values => {
            fetch('register', values, 'POST')
                .then(res => {
                    setUser(res.data)
                })
                .catch(e => {
                    console.log(e)
                    if (e.response && e.response.data && e.response.data.message) {
                        alert(e.response.data.message);
                    } else {
                        alert('There was a problem, try again later');
                    }
                })
        }
    })

    if (user) {
        return <Navigate to={previousPage ? previousPage : '/'}/>
    }

    return (<form onSubmit={formik.handleSubmit} className={styles.form}>
        <LoadPage loading={loading}/>
        <h1>Register</h1>
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
            <input 
                type={'password'} 
                name={'password_repeat'}
                placeholder='Repeat password'
                value={formik.values.password_repeat} 
                onChange={formik.handleChange} 
                onBlur={formik.handleBlur}
                />
            {
                formik.touched.password_repeat && Boolean(formik.errors.password_repeat) &&
                <div className="error">{formik.errors.password_repeat}</div>
            }
        </div>
        <div className='form-control'>
            <button className='btn btn-primary'>Register</button>
        </div>
    </form>)
}

export default Register