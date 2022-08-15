import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './RentBike.module.css'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { dateToString, stringToDate } from '../../utils/dates'
import { BikeType } from '../../utils/types'
import useApi from '../../hooks/useApi'
import LoadPage from '../../components/LoadPage/LoadPage'

export interface IRentBikeProps {}

const today = new Date()
today.setHours(0)
today.setMinutes(0)
today.setSeconds(0)
today.setMilliseconds(0)

const validationSchema = yup.object({
    fromDate: yup
        .date()
        .test(
            "greater_than_today",
            "From date must be greater than today",
            function (value) {
                let time = value ? value.getTime() : 0
                return time >= today.getTime();
            })
        .required('You must select a date'),
    toDate: yup
        .date()
        .min(yup.ref('fromDate'), `To Date must be greater than or equal to From Date`)
        .required('You must select a return date'),
    bikeId: yup.string().required('You must select a bike')
})
type filterType = {models: string, colors: string, locations: string, rating: number | undefined}

const RentBike: React.FC<IRentBikeProps> = (props) => {
    // Only available bikes
    const [bikes, setRentBike] = useState<BikeType[]>([])
    const [filters, setFilters] = useState<filterType>({models: '', colors: '', locations: '', rating: 0})
    const [filterModels, setFilterModels] = useState<string[]>([])
    const [filterColors, setFilterColors] = useState<string[]>([])
    const [filterLocations, setFilterLocations] = useState<string[]>([])
    const { loading, fetch } = useApi()

    const formik = useFormik({
        initialValues: {
            fromDate: dateToString(today),
            toDate: dateToString(today),
            bikeId: undefined
        },
        validateOnChange: true,
        validateOnBlur: false,
        initialTouched: {
            fromDate: true,
            toDate: true
        },
        validationSchema,
        onSubmit: values => {
            fetch('reservations', values, 'POST')
                .then(res => {
                    console.log(res)
                    alert("Reservation made correctly")
                    formik.resetForm()
                    loadBikes()
                })
                .catch(err => {
                    console.log(err)
                    alert("There was an error, please try again later")
                })
        }
    })

    const { fromDate, toDate } = formik.values;

    const loadBikes = useCallback(() => {
        console.log(fromDate, toDate)
        let fromDateD = stringToDate(fromDate)
        let toDateD = stringToDate(toDate)
        toDateD.setHours(12)
        toDateD.setMinutes(0)
        toDateD.setSeconds(0)
        if (fromDate && toDate && fromDateD >= today && fromDateD <= toDateD) {
            fetch(`availableBikes?fromDate=${fromDate}&toDate=${toDate}`)
            .then(res => {
                let modelsSet = new Set<string>()
                let colorsSet = new Set<string>()
                let locationsSet = new Set<string>()

                res.data.forEach((bike: BikeType) => {
                    modelsSet.add(bike.model.toLowerCase())
                    colorsSet.add(bike.color.toLowerCase())
                    locationsSet.add(bike.location.toLowerCase())
                })

                setRentBike(res.data)
                
                // Update filters
                setFilterModels(Array.from<string>(modelsSet))
                setFilterColors(Array.from<string>(colorsSet))
                setFilterLocations(Array.from<string>(locationsSet))
            })
            .catch(err => {

            })
        }

    }, [fetch, fromDate, toDate])

    useEffect(() => {
        loadBikes()
    }, [loadBikes])

    const selectBike = (id: string) => {
        formik.setFieldValue('bikeId', id)
        formik.setFieldError('bikeId', undefined)
    }

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
        setFilters(prevFilter => {
            let filterClone: any = {...prevFilter}
            filterClone[e.target.name] = e.target.value
            return filterClone
        })
    }

    const { models, colors, locations, rating } = filters

    const filteredRentBike = useMemo(() => {
        let result = [...bikes]
        if (models !== '') {
            result = result.filter(item => item.model.toLowerCase() === models)
        }
        if (colors !== '') {
            result = result.filter(item => item.color.toLowerCase() === colors)
        }
        if (locations !== '') {
            result = result.filter(item => item.location.toLowerCase() === locations)
        }
        if (rating && !isNaN(rating) && rating > 0) {
            result = result.filter(item => Math.abs(item.rating - rating) < 0.1)
        }
        return result
    }, [models, colors, locations, rating, bikes])

    return (
        <>
        {
            loading && <LoadPage loading={loading}/>
        }
        <div className={styles.container}>
            <div className={styles.filter}>
                <h3>Filter by</h3>
                <div className={styles.filters}>
                    Model: <select onChange={handleFilterChange} value={filters.models} name='models'>
                        <option value={''}>--</option>
                        {
                            filterModels.map(item => <option key={item} value={item}>{item}</option>)
                        }
                    </select>
                    Color: <select onChange={handleFilterChange} value={filters.colors} name='colors'>
                        <option value={''}>--</option>
                        {
                            filterColors.map(item => <option key={item} value={item}>{item}</option>)
                        }
                    </select>
                    Location: <select onChange={handleFilterChange} value={filters.locations} name='locations'>
                        <option value={''}>--</option>
                        {
                            filterLocations.map(item => <option key={item} value={item}>{item}</option>)
                        }
                    </select>
                    Rating: <input onChange={handleFilterChange} value={filters.rating} name='rating' type={'number'} min={1} max={5}/>
                    <span></span>
                    <button 
                        onClick={() => {setFilters({models: '', colors: '', locations: '', rating: 0})}}
                        className='btn btn-small btn-block'>Clear filters</button>
                </div>
            </div>
            <form onSubmit={formik.handleSubmit}  className={styles.form}>
                <div className={styles.datesContainer}>
                    <div className='form-control'>
                        <label htmlFor='fromDate'>From</label>
                        <input 
                            type={'date'} 
                            id='fromDate'
                            name={'fromDate'}
                            placeholder='From'
                            value={formik.values.fromDate.toString()}
                            onChange={formik.handleChange} 
                            onBlur={formik.handleBlur}
                            />
                        {
                            formik.touched.fromDate && Boolean(formik.errors.fromDate) &&
                            <div className="error">{formik.errors.fromDate as string}</div>
                        }
                    </div>
                    <div className='form-control'>
                        <label htmlFor='toDate'>To</label>
                        <input 
                            type={'date'} 
                            id='toDate'
                            name={'toDate'}
                            placeholder='To'
                            value={formik.values.toDate.toString()} 
                            onChange={formik.handleChange} 
                            onBlur={formik.handleBlur}
                            />
                        {
                            formik.touched.toDate && Boolean(formik.errors.toDate) &&
                            <div className="error">{formik.errors.toDate as string}</div>
                        }
                    </div>
                </div>
                <table className={'table '+styles.table}>
                    <thead style={{width: filteredRentBike.length >= 11 ? 'calc(100% - 17px)' : '100%'}}>
                        <tr>
                            <th>#</th>
                            <th>Model</th>
                            <th>Color</th>
                            <th>Location</th>
                            <th>Rate</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredRentBike.map(bike => <tr key={bike.id}>
                                <td>{bike.id}</td>
                                <td>{bike.model}</td>
                                <td>{bike.color}</td>
                                <td>{bike.location}</td>
                                <td>{+bike.rating < 1 ? '--' : (+bike.rating).toFixed(1)}</td>
                                <td><input onChange={() => {selectBike(bike.id)}} type={'radio'} checked={formik.values.bikeId === bike.id}/></td>
                            </tr>)
                        }
                    </tbody>
                </table>
                <div className="form-control">
                    {
                        formik.touched.bikeId && Boolean(formik.errors.bikeId) &&
                        <div className="error">{formik.errors.bikeId}</div>
                    }
                </div>
                <div className="form-control" style={{marginTop: '20px'}}>
                    <button type='submit' className='btn btn-primary'>Make Reservation</button>
                </div>
            </form>
        </div></>
    )
}

export default RentBike