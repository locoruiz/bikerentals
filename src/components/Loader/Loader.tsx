import React from 'react'
import styles from './Loader.module.css'

export interface ILoaderProps {
    width?:string;
    height?:string;
}

const Loader: React.FC<ILoaderProps> = ({ width, height }) => {
    let w = width ?? '50px'
    let h = height ?? '50px'
    return (<div style={{width: w, height: h}} className={styles.loader}></div>)
}

export default Loader