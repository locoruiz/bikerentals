import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { userContext } from '../../context/userContext'
import styles from './Home.module.css'
export interface HomeProps {}

const Home: React.FC<HomeProps> = (props) => {
    const { user } = useContext(userContext)
    return (<div className={styles.container}>
        <div className={styles.message}>
            <h1>Bike Rentals</h1>
            <p>Here you can rent bikes :)</p>
            {
                user && 
                <p>Welcome {user.username}</p> &&
                <p>Click <Link to={'rentBike'}>here</Link> to rent bikes</p>
            }
        </div>
    </div>)
}

export default Home