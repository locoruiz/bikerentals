import React, { ReactElement, useContext } from 'react'
import { userContext } from '../context/userContext'

export interface IPrivateRouteProps {
    role?: 'User'|'Manager';
    children: ReactElement;
}

const PrivateRoute: React.FC<IPrivateRouteProps> = ({role, children}) => {
    // If role is not selected it is for both
    const { user } = useContext(userContext)
    let forbiden = (<div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <h1>403</h1>
        <h3>Not allowed to view this page.</h3>
    </div>)
    if (user === undefined) {
        return forbiden
    }
    if (role && role !== user.role) {
        return forbiden
    }
    return (children)
}

export default PrivateRoute