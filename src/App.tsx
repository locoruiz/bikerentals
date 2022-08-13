import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DefaultNotFound from './components/DefaultNotFound';
import Footer from './components/Footer';
import Nav from './components/Nav';
import Home from './pages/Home/Home';

import { userContext } from './context/userContext';
import useLocalStorage from './hooks/useLocalStorage';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Bikes from './pages/Bikes/Bikes';
import Reservation from './pages/Reservation/Reservation';
import RentBike from './pages/RentBike/RentBike';
import PrivateRoute from './components/PrivateRoute';
import Users from './pages/Users/Users';

const USER_STORAGE_KEY = "toptalUserLogged"

const App: React.FC = () => {
  const [user, setUser] = useLocalStorage(USER_STORAGE_KEY)

  return (
    <userContext.Provider value={{user, setUser}}>
      <BrowserRouter>
        <Nav/>
        <div className='page-container'>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
            <Route path='/bikes' element={<PrivateRoute role='Manager'><Bikes/></PrivateRoute>}/>
            <Route path='/rentBike' element={<PrivateRoute><RentBike/></PrivateRoute>}/>
            <Route path='/reservations' element={<PrivateRoute><Reservation/></PrivateRoute>}/>
            <Route path='/users' element={<PrivateRoute role='Manager'><Users/></PrivateRoute>}/>
            <Route path='*' element={<DefaultNotFound/>}/>
          </Routes>
        </div>
        <Footer/>
      </BrowserRouter>
    </userContext.Provider>
  )
}

export default App;
