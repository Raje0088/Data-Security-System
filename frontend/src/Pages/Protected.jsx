import React from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context-api/AuthContext'
import { Link, Navigate } from 'react-router-dom'

const Protected = ({children}) => {
    const {userLoginId, loading} = useContext(AuthContext)

    if(loading) return null;
    if(!userLoginId?.userId){
        return <Navigate to="/login" />
    }
  return children
  
}

export default Protected
