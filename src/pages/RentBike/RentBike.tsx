import React, { useEffect, useMemo, useState } from 'react'
import styles from './RentBike.module.css'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { dateToString } from '../../utils/dates'
import { BikeType } from '../../utils/types'

export interface IRentBikeProps {}

//TODO: Eliminar estos datos de ejemplo
const ARcolors = ['red', 'black', 'white', 'yellow']
const ARmodels = ['Bianchi Kuma 29.2.', 'Trek Dual Sport 2', 'Mach City iBike ', 'Cannondale Trail 6', 'Ridley Helium SLA Disc 105']
const ARlocations = ['La Paz', 'Cochabamba', 'Santa Cruz']

const randomObject = (arr: any[]) => {
    return arr[Math.floor(Math.random() * arr.length)]
}

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
    const formik = useFormik({
        initialValues: {
            fromDate: dateToString(today),
            toDate: dateToString(today),
            bikeId: undefined
        },
        validationSchema,
        onSubmit: values => {
            console.log(values)
            //TODO: Make reservation
        }
    })

    useEffect(() => {
        // TODO: Load bikes for the first day
        let bikesCopy:BikeType[]  = []
        let modelsSet = new Set<string>()
        let colorsSet = new Set<string>()
        let locationsSet = new Set<string>()

        for (let i = 0; i < 100; i++) {
            let model = randomObject(ARmodels)
            let color = randomObject(ARcolors)
            let location = randomObject(ARlocations)

            bikesCopy.push({id: i.toString(), model, color, location, rating: Math.floor(Math.random() * 5) + 1})
            modelsSet.add(model)
            colorsSet.add(color)
            locationsSet.add(location)
        }
        setRentBike(bikesCopy)
        
        // Update filters
        setFilterModels(Array.from<string>(modelsSet))
        setFilterColors(Array.from<string>(colorsSet))
        setFilterLocations(Array.from<string>(locationsSet))
    }, [])

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
            result = result.filter(item => item.model === models)
        }
        if (colors !== '') {
            result = result.filter(item => item.color === colors)
        }
        if (locations !== '') {
            result = result.filter(item => item.location === locations)
        }
        if (rating && !isNaN(rating) && rating > 0) {
            result = result.filter(item => Math.abs(item.rating - rating) < 0.1)
        }
        return result
    }, [models, colors, locations, rating, bikes])

    return (
        <>
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
                    Rate: <input onChange={handleFilterChange} value={filters.rating} name='rating' type={'number'} min={1} max={5}/>
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
                    <thead>
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
                                <td>{bike.rating.toFixed(1)}</td>
                                <td><input onClick={() => {selectBike(bike.id)}} name='bike' type={'radio'}/></td>
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