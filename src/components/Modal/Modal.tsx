import React, { ReactElement, useEffect, useRef, useState } from 'react'
import styles from './Modal.module.css'

export interface IModalProps {
    title?: string;
    visible: boolean
    children?: ReactElement;
    onClose: () => void;
    onOk?: () => void;
    footer?: ReactElement
}

const Modal: React.FC<IModalProps> = ({title, footer, onClose, onOk, visible, children}) => {
    const bgRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const [display, setDisplay] = useState(false)

    useEffect(() => {
        if (visible === false) {
            bgRef.current?.classList.add(styles.fadeOut)
            bgRef.current?.addEventListener('transitionend', () => {
                setDisplay(false)
            }, { once:true })
        } else {
            setDisplay(true)
        }
    }, [visible])

    const closeModal = () => {
        onClose()
    }

    const modalClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
    }

    const handleOk = () => {
        if (onOk) {
            onOk()
        }
    }

    return (
        <>
            {
                display && <div className={styles.background} ref={bgRef} onClick={closeModal}>
                    <div className={styles.modal} ref={modalRef} onClick={modalClick}>
                        <div className={styles.header}>{title}<span onClick={closeModal}>&#10006;</span></div>
                        <div className={styles.body}>{children}</div>
                        <div className={styles.footer}>{
                            footer ? footer : <><button onClick={handleOk} type='button' className='btn btn-secondary btn-small'>Ok</button> <button  onClick={closeModal} type='button' className='btn btn-primary btn-small'>Cancel</button></>
                        }</div>
                    </div>
                </div>
            }
        </>
    )
}

export default Modal