import React from 'react'
import Loader from '../Loader/Loader';
import styles from './LoadPage.module.css'


export interface ILoadPageProps {
    loading: boolean;
}

const LoadPage: React.FC<ILoadPageProps> = ({loading}) => {
    return (<>
        {
            loading &&
            <div className={styles.container}>
                <div className={styles.loader}><Loader/></div>
            </div>
        }
    </>)
}

export default LoadPage