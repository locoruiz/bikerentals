import React, { useContext, useEffect, useState } from 'react'
import styles from './Users.module.css'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { UserType } from '../../utils/types'
import useApi from '../../hooks/useApi'
import Loader from '../../components/Loader/Loader'
import Modal from '../../components/Modal/Modal'
import LoadPage from '../../components/LoadPage/LoadPage'
import { userContext } from '../../context/userContext'


export interface IUsersProps {}

const validationSchema = yup.object({
    id: yup.number(),
    username: yup
          .string()
          .required('Username is required'),
    password: yup
              .string()
              .when("id", {
                is: 0,
                then: yup.string().required("Password is required")
              }),
    password_repeat: yup
              .string()
              .when("id", {
                is: 0,
                then: yup.string().required('You must repeat password')
                .oneOf([yup.ref('password'), null], 'Passwords are not the same'),
              }),
    role: yup.string().required('Role is required')
})

type UsageType = {
    id: number,
    model: string,
    color: string,
    location: string,
    fromDate: string, 
    toDate: string
}

const Users: React.FC<IUsersProps> = (props) => {
    // Only available users
    const [users, setUsers] = useState<UserType[]>([])
    const [editingUser, setEditingUser] = useState<UserType | undefined>()
    const { loading, fetch } = useApi()
    const [formVisible, setFormVisible] = useState(false)
    const [bikes, setBikes] = useState<UsageType[]>([])
    const [showBikesModal, setShowBikesmodal] = useState(false)
    const [pageLoad, setPageLoad] = useState(false)

    const { user } = useContext(userContext)

    const formik = useFormik({
        initialValues: {
            id: 0,
            username: '',
            password: '',
            password_repeat: '',
            role: 'User'
        },
        validationSchema,
        onSubmit: values => {
            setPageLoad(true)
            if (editingUser) {
                let editObject: any = {}
                if (values.password === '') {
                    editObject = {
                        username: values.username,
                        role: values.role
                    }
                } else {
                    editObject = {
                        username: values.username,
                        password: values.password,
                        password_repeat: values.password_repeat,
                        role: values.role
                    }
                }
                fetch('users/'+editingUser.id, editObject, 'PUT')
                .then((res) => {
                    setUsers(users.map(user => {
                        if (user.id === editingUser.id) {
                            return res.data
                        }
                        return user
                    }))
                    closeForm()
                })
                .catch(e => {
                    console.log(e)
                    alert('There was a problem, please try again later')
                })
                .finally(() => {setPageLoad(false)})
            } else {
                fetch('users', values, 'POST')
                .then((res) => {
                    setUsers([res.data, ...users])
                    closeForm()
                })
                .catch(e => {
                    console.log(e)
                    alert('There was a problem, please try again later')
                })
                .finally(() => {setPageLoad(false)})
            }
        }
    })

    useEffect(() => {
        fetch('users')
            .then((res) => {
                setUsers(res.data)
            })
            .catch(e => {
                console.log(e)
                alert('There was a problem fetching the users')
            })
    }, [fetch])

    const selectUser = (user: UserType) => {
        setEditingUser(user)
        setFormVisible(true)
        formik.setValues({...user, password: '', password_repeat: ''})
    }

    const deleteUser = () => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            closeForm()
            fetch('users/'+editingUser?.id, {}, 'DELETE')
                .then((res) => {
                    setUsers(users.filter(b => b.id !== editingUser?.id))
                })
                .catch(e => {
                    console.log(e)
                    alert('There was a problem deleting the user, try again later')
                })
        }
    }
    const closeForm = () => {
        setFormVisible(false); 
        setEditingUser(undefined); 
        formik.resetForm();
    }

    const fetchBikes = (userId: number) => {
        setPageLoad(true)
        fetch(`users/${userId}/bikes`)
            .then(res => {
                if (res.data.length > 0) {
                    setBikes(res.data)
                    setShowBikesmodal(true)
                } else {
                    alert('This user never reserved a Bike')
                }
            })
            .catch(err => {
                console.log(err)
                alert('There was a problem fetching the bikes, please try again later')
            })
            .finally(() => {setPageLoad(false)})
    }

    return (
        <>
        {
            pageLoad &&
            <LoadPage loading={pageLoad}/>
        }
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Registered Users</h1>
                <button 
                    onClick={() => {setFormVisible(true)}}
                    className='btn btn-primary'>
                        Add New
                </button>
            </div>
            {
                (loading && pageLoad === false) || users.length === 0 ?
                (loading && pageLoad === false) ? <Loader/> : <h2>There are no users registered</h2>
                :
                <table className={'table '+styles.table}>
                    <tbody>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                        {
                            users.map(user => <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button 
                                        onClick={() => {selectUser(user)}} 
                                        type={'button'}
                                        className='btn btn-primary btn-small'
                                        >
                                            Edit
                                    </button>&nbsp;
                                    <button 
                                        onClick={() => {fetchBikes(user.id)}} 
                                        type={'button'}
                                        className='btn btn-small'
                                        title='Bikes reserved by user'
                                        >
                                            See bikes
                                    </button>
                                </td>
                            </tr>)
                        }
                    </tbody>
                </table>
            }

            <Modal 
                title={ editingUser ? 'Edit User' : 'Register User' }
                visible={formVisible} 
                onClose={closeForm}
                footer={
                    <div className={styles.modalFooter}>
                        <button 
                            onClick={formik.submitForm}
                            className='btn btn-primary btn-small'>Save</button>
                        {
                            editingUser &&
                            <>
                                <button 
                                    onClick={deleteUser}
                                    className='btn btn-secondary btn-small'>Delete</button>
                                <button 
                                    onClick={closeForm}
                                    className='btn btn-small'>Cancel</button>
                            </>
                        }
                    </div>
                }
                >
                <form onSubmit={formik.handleSubmit}  className={styles.form}>
                    {
                        editingUser &&
                        <div className='form-control'>
                            <label htmlFor='id'>Id</label>
                            <input 
                                type={'text'}
                                value={editingUser.id}
                                disabled
                                />
                        </div>
                    }
                    <div className='form-control'>
                        <label htmlFor='model'>Username</label>
                        <input 
                            type={'text'} 
                            id='username'
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
                        <label htmlFor='model'>Password</label>
                        <input 
                            type={'password'}
                            id='password'
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
                        <label htmlFor='password_repeat'>Repeat password</label>
                        <input 
                            type={'password'} 
                            id='password_repeat'
                            name={'password_repeat'}
                            placeholder='Repeat Password'
                            value={formik.values.password_repeat}
                            onChange={formik.handleChange} 
                            onBlur={formik.handleBlur}
                            />
                        {
                            formik.touched.password_repeat && Boolean(formik.errors.password_repeat) &&
                            <div className="error">{formik.errors.password_repeat}</div>
                        }
                    </div>
                    <div>
                        <label style={{marginLeft: '10px', fontWeight: 'bold'}} htmlFor='role'>Role: </label>
                        <select
                            id='role'
                            name={'role'}
                            placeholder='Role'
                            value={formik.values.role}
                            onChange={formik.handleChange} 
                            onBlur={formik.handleBlur}
                            style={{padding: '10px'}}
                            disabled={user?.id === editingUser?.id}
                            >
                                <option style={{padding: '10px'}}>User</option>
                                <option style={{padding: '10px'}}>Manager</option>
                        </select>
                        {
                            formik.touched.role && Boolean(formik.errors.role) &&
                            <div className="error">{formik.errors.role}</div>
                        }
                    </div>
                </form>
            </Modal>
            <Modal 
                title={ 'Bikes reserved by this user' }
                visible={showBikesModal}
                onClose={() => {setShowBikesmodal(false)}}
                footer={
                    <div className={styles.modalFooter}>
                        <button 
                            onClick={() => {setShowBikesmodal(false)}}
                            className='btn btn-primary btn-small'>Close</button>
                    </div>
                }
                >
                <table className='table'>
                    <thead style={{width: bikes.length <= 11 ? '100%' : 'calc(100% - 17px)'}}>
                        <tr>
                            <th>Id</th>
                            <th>Model</th>
                            <th>Color</th>
                            <th>From</th>
                            <th>To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            bikes.map((bike, index) => <tr key={index}>
                                <td>{bike.id}</td>
                                <td>{bike.model}</td>
                                <td>{bike.color}</td>
                                <td style={{textAlign: 'center'}}>{bike.fromDate.substring(0, 10)}</td>
                                <td style={{textAlign: 'center'}}>{bike.toDate.substring(0, 10)}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </Modal>
        </div>
        </>
    )
}

export default Users