import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { userContext } from '../context/userContext'

const Nav: React.FC = () => {
    const {user, setUser} = useContext(userContext)
    const logout = () => {
        setUser(undefined)
    }

    let menuItems: any[] = []

    if (user ) {
        menuItems = [{to: '/rentBike', label: 'Rent a Bike'}, {to: '/reservations', label: 'Reservations'}, {to: '/', label: 'Logout'}]
        if (user.role === 'Manager') {
            menuItems.unshift({to: '/users', label: 'Users'}, {to: '/bikes', label: 'Bikes'})
        }
    }

    return (
    <nav>
        <Link to={'/'} style={{ textDecoration: 'none', color: 'black' }}><h2>Bike Rentals</h2></Link>
        <span>
            { user ? 
                menuItems.map((item, idx) => idx < menuItems.length - 1 ? <React.Fragment key={item.to}><Link to={item.to}>{item.label}</Link> | </React.Fragment> : <Link onClick={logout} key={item.to} to={item.to}>{item.label}</Link>)
                : 
                <><Link to={'/login'}>Login</Link> | <Link to={'/register'}>Register</Link></>
            }
        </span>
    </nav>
    )
}

export default Nav