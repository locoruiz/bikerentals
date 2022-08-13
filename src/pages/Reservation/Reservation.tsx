import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../components/Modal/Modal'
import Rate from '../../components/Rate/Rate'
import { toLocaleDateString } from '../../utils/dates'
import { ReservationType } from '../../utils/types'

import styles from './Reservation.module.css'


export interface IReservationProps {}

const Reservation: React.FC<IReservationProps> = (props) => {

    const [reservations, setReservations] = useState<ReservationType[]>([])
    const [showRate, setShowRate] = useState<ReservationType | undefined>(undefined)

    useEffect(() => {
        //TODO: Fetch from a server the reservations
        let today = new Date()
        let tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        let res: ReservationType[] = [
            {
                id: 1,
                fromDate: today,
                toDate: tomorrow,
                bike: {
                    id: '1',
                    model: 'Bianchi',
                    color: 'red',
                    location: 'Cochabamba',
                    rating: 5
                },
                rating: 1
            },
            {
                id: 2,
                fromDate: today,
                toDate: tomorrow,
                bike: {
                    id: '2',
                    model: 'Bianchi',
                    color: 'azul',
                    location: 'Tarija',
                    rating: 4.4
                },
                rating: 2
            }
        ]
        setReservations(res)
    }, [])

    const cancelReservation = (reservationId: number) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            setReservations(reservations.filter(res => res.id !== reservationId))
        }
    }

    const showRateModal = (reservation: ReservationType) => {
        setShowRate(reservation)
    }

    const hideRateModal = () => {
        setShowRate(undefined)
    }

    const submitRate = () => {
        //TODO: Submit rating
        setReservations(res => res.map(r => r.id === showRate?.id ? {...showRate} : r))
        
        hideRateModal()
    }

    return (
        reservations.length === 0 ? <div className={styles.message}>You don't have reservations. <br/> Click <Link to={'/bikes'}>here</Link> to make a reservation</div> :
        <>
            <div>
                <h2 className={styles.title}>Reservations</h2>
                <table className={'table '+styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Bike Model</th>
                            <th>Bike Color</th>
                            <th>Location</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reservations.map(reservation => <tr key={reservation.id}>
                                <td>{reservation.id}</td>
                                <td>{toLocaleDateString(reservation.fromDate)}</td>
                                <td>{toLocaleDateString(reservation.toDate)}</td>
                                <td>{reservation.bike.model}</td>
                                <td>{reservation.bike.color}</td>
                                <td>{reservation.bike.location}</td>
                                <td><button type='button' className='btn btn-primary btn-block btn-small' onClick={() => {showRateModal(reservation)}}>Rate</button></td>
                                <td><button title='Cancel Reservation' type='button' className='btn btn-secondary btn-block btn-small' onClick={() => {cancelReservation(reservation.id)}}>Cancel</button></td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
            <Modal visible={Boolean(showRate)} onClose={hideRateModal} onOk={submitRate} title='Rating'
                footer={<><button className='btn btn-secondary btn-small' onClick={submitRate}>Submit</button> <button className='btn btn-primary btn-small' onClick={hideRateModal}>Cancel</button></>}
            >
                {
                    showRate &&
                    <>
                        <p>Set the rating for the bike: {showRate.bike.model}</p>
                        <Rate numberOfStars={5} value={showRate.rating} setValue={(val) => {setShowRate({...showRate, rating: val})}}/>
                    </>
                }
            </Modal>
        </>
        )
}

export default Reservation