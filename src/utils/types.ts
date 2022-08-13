export type UserType = {
    id: number,
    username: string,
    token: string,
    role: 'User' | 'Manager'
}

export type BikeType = {
    id: string,
    model: string,
    color: string, 
    location: string, 
    rating: number,
    available?: boolean
}

export type ReservationType = {
    id: number,
    fromDate: Date,
    toDate: Date,
    bike: BikeType,
    rating: number
}
