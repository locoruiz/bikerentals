import React, { useEffect, useState } from 'react'
import styles from './Bikes.module.css'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { BikeType } from '../../utils/types'
import useApi from '../../hooks/useApi'
import Loader from '../../components/Loader/Loader'
import Modal from '../../components/Modal/Modal'
import LoadPage from '../../components/LoadPage/LoadPage'


type UsageType = {
    username: string,
    fromDate: string,
    toDate: string
}

export interface IBikesProps {}

const validationSchema = yup.object({
    model: yup.string().required('Model is required'),
    color: yup.string().required('Color is required'),
    location: yup.string().required('Location is required')
})

const Bikes: React.FC<IBikesProps> = (props) => {
    // Only available bikes
    const [bikes, setBikes] = useState<BikeType[]>([])
    const [editingBike, setEditingBike] = useState<BikeType | undefined>()
    const [showUsersModal, setShowUsersModal] = useState(false)
    const [users, setUsers] = useState<UsageType[]>([])
    const [pageLoad, setPageLoad] = useState(false)
    const { loading, fetch } = useApi()
    const [formVisible, setFormVisible] = useState(false)

    const formik = useFormik({
        initialValues: {
            model: '',
            color: '',
            location: ''
        },
        validationSchema,
        onSubmit: values => {
            setPageLoad(true)
            if (editingBike) {
                fetch('bikes/'+editingBike.id, values, 'PUT')
                .then((res) => {
                    setBikes(bikes.map(bike => {
                        if (bike.id === editingBike.id) {
                            return res.data
                        }
                        return bike
                    }))
                    closeForm()
                })
                .catch(e => {
                    console.log(e)
                    alert('There was a problem, please try again later')
                })
                .finally(() => {setPageLoad(false)})
            } else {
                fetch('bikes', values, 'POST')
                .then((res) => {
                    setBikes([res.data, ...bikes])
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
        fetch('bikes')
            .then((res) => {
                setBikes(res.data)
            })
            .catch(e => {
                console.log(e)
                alert('There was a problem fetching the bikes')
            })
    }, [fetch])

    const selectBike = (bike: BikeType) => {
        setEditingBike(bike)
        setFormVisible(true)
        formik.setValues(bike)
    }

    const deleteBike = () => {
        if (window.confirm('Are you sure you want to delete this bike?')) {
            closeForm()
            fetch('bikes/'+editingBike?.id, {}, 'DELETE')
                .then((res) => {
                    setBikes(bikes.filter(b => b.id !== editingBike?.id))
                })
                .catch(e => {
                    console.log(e)
                    alert('There was a problem deleting the bike, try again later')
                })
        }
    }
    const closeForm = () => {
        setFormVisible(false); 
        setEditingBike(undefined); 
        formik.resetForm();
    }

    const fetchUsers = (bikeId: number) => {
        setPageLoad(true)
        fetch(`bikes/${bikeId}/users`)
            .then(res => {
                if (res.data.length > 0) {
                    setUsers(res.data)
                    setShowUsersModal(true)
                } else {
                    alert('This bike was never reserved')
                }
            })
            .catch(err => {
                console.log(err)
                alert('There was an error fetching the users, please try again later')
            })
            .finally(() => {setPageLoad(false)})
    }

    return (
        <>
        {
            pageLoad && <LoadPage loading={pageLoad}/>
        }
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Registered Bikes</h1>
                <button 
                    onClick={() => {setFormVisible(true)}}
                    className='btn btn-primary'>
                        Add New
                </button>
            </div>
            {
                (loading && pageLoad === false) || bikes.length === 0 ?
                loading && pageLoad === false ? <Loader/> : <h2>There are no bikes registered</h2>
                :
                <table className={'table '+styles.table}>
                    <tbody>
                        <tr>
                            <th>#</th>
                            <th>Model</th>
                            <th>Color</th>
                            <th>Location</th>
                            <th title='rating'>R.</th>
                            <th title='Available today'>A.</th>
                            <th></th>
                        </tr>
                        {
                            bikes.map(bike => <tr key={bike.id}>
                                <td>{bike.id}</td>
                                <td>{bike.model}</td>
                                <td>{bike.color}</td>
                                <td>{bike.location}</td>
                                <td>{(+bike.rating).toFixed(1)}</td>
                                <td><input type={'checkbox'} checked={bike.available} disabled/></td>
                                <td>
                                    <button 
                                        onClick={() => {selectBike(bike)}} 
                                        type={'button'}
                                        className='btn btn-primary btn-small'
                                        >
                                            Edit
                                    </button>
                                    &nbsp;
                                    <button 
                                        onClick={() => {fetchUsers(+bike.id)}}
                                        type={'button'}
                                        className='btn btn-small'
                                        title='Users who reserved it'
                                        >
                                            Show users
                                    </button>
                                </td>
                            </tr>)
                        }
                    </tbody>
                </table>
            }

            <Modal 
                title={ editingBike ? 'Edit Bike' : 'Register Bike' }
                visible={formVisible} 
                onClose={closeForm}
                footer={
                    <div className={styles.modalFooter}>
                        <button 
                            onClick={formik.submitForm}
                            className='btn btn-primary btn-small'>Save</button>
                        {
                            editingBike &&
                            <>
                                <button 
                                    onClick={deleteBike}
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
                        editingBike &&
                        <div className='form-control'>
                            <label htmlFor='id'>Id</label>
                            <input 
                                type={'text'}
                                value={editingBike.id}
                                disabled
                                />
                        </div>
                    }
                    <div className='form-control'>
                        <label htmlFor='model'>Model</label>
                        <input 
                            type={'text'} 
                            id='model'
                            name={'model'}
                            placeholder='Model'
                            value={formik.values.model}
                            onChange={formik.handleChange} 
                            onBlur={formik.handleBlur}
                            />
                        {
                            formik.touched.model && Boolean(formik.errors.model) &&
                            <div className="error">{formik.errors.model}</div>
                        }
                    </div>
                    <div className='form-control'>
                        <label htmlFor='model'>Color</label>
                        <input 
                            type={'text'} 
                            id='color'
                            name={'color'}
                            placeholder='Color'
                            value={formik.values.color}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            />
                        {
                            formik.touched.color && Boolean(formik.errors.color) &&
                            <div className="error">{formik.errors.color}</div>
                        }
                    </div>
                    <div className='form-control'>
                        <label htmlFor='location'>Location</label>
                        <input 
                            type={'text'} 
                            id='location'
                            name={'location'}
                            placeholder='Location'
                            value={formik.values.location}
                            onChange={formik.handleChange} 
                            onBlur={formik.handleBlur}
                            />
                        {
                            formik.touched.location && Boolean(formik.errors.location) &&
                            <div className="error">{formik.errors.location}</div>
                        }
                    </div>
                </form>
            </Modal>
            <Modal 
                title={ 'Users who used reserved this bike' }
                visible={showUsersModal}
                onClose={() => {setShowUsersModal(false)}}
                footer={
                    <div className={styles.modalFooter}>
                        <button 
                            onClick={() => {setShowUsersModal(false)}}
                            className='btn btn-primary btn-small'>Close</button>
                    </div>
                }
                >
                <table className='table'>
                    <thead style={{width: users.length <= 11 ? '100%' : 'calc(100% - 17px)'}}>
                        <tr>
                            <th>Username</th>
                            <th>From</th>
                            <th>To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map((user, index) => <tr key={index}>
                                <td>{user.username}</td>
                                <td style={{textAlign: 'center'}}>{user.fromDate.substring(0, 10)}</td>
                                <td style={{textAlign: 'center'}}>{user.toDate.substring(0, 10)}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </Modal>
        </div>
        </>
    )
}

export default Bikes