import React from 'react'

export interface IDefaultNotFoundProps {}

const DefaultNotFound: React.FC<IDefaultNotFoundProps> = (props) => {
    return (<div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <h1>404</h1>
        <h3>Page not found</h3>
    </div>)
}

export default DefaultNotFound