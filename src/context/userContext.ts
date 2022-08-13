import React from 'react';

import { UserType } from '../utils/types'

type userContextType = {
    user: UserType|undefined;
    setUser: (value: UserType | undefined) => void;
}

const userContext = React.createContext<userContextType>({user: undefined, setUser: () => {}});

export { userContext };