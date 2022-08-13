import { useCallback, useContext, useState } from 'react'
import axios, { AxiosResponse }  from 'axios'
import { userContext } from '../context/userContext'

const BASE_URL = 'http://localhost:5001/bikes-359120/us-central1/app/'

export default function useApi() {
    const [loading, setLoading] = useState(false)
    const { user } = useContext(userContext)
    
    const fetch = useCallback(async (url: string, body: any = {}, type: 'POST'|'PUT'|'DELETE'|'GET' = 'GET') => {
        const fullUrl = `${BASE_URL}${url}`
        const headers: any = {}
        if (user) {
            headers.Authorization = `Bearer ${user.token}`
        }
        setLoading(true)
        let res: AxiosResponse;
        let error = false
        try {
            switch(type) {
                case 'GET':
                    res = await axios.get(fullUrl, {headers})
                    break;
                case 'POST':
                    res = await axios.post(fullUrl, body, {headers})
                    break;
                case 'PUT':
                    res = await axios.put(fullUrl, body, {headers})
                    break;
                case 'DELETE':
                    res = await axios.delete(fullUrl, {headers})
                    break;
            }
        } catch (e: any) {
            error = true
            res = e
        } finally {
            setLoading(false)
        }
        if (!error) {
            return res
        } else {
            return Promise.reject(res)
        }
    }, [user])

    return {loading, fetch}
}