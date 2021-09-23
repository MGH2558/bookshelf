import React from 'react'
import { createContext } from 'react';
// COMPONENTS AND FUNCTIONS
import * as auth from 'auth-provider'
import { FullPageSpinner, FullPageErrorFallback } from 'components/lib'
import { client } from 'utils/api-client'
import { useAsync } from 'utils/hooks'

const AuthContext = createContext()
AuthContext.displayName = 'AuthContext'

async function getUser() {
    let user = null

    const token = await auth.getToken()
    if (token) {
        const data = await client('me', { token })
        user = data.user
    }

    return user
}


function AuthProvider(props) {
    const {
        data: user,
        error,
        isSuccess,
        isLoading,
        isIdle,
        isError,
        run,
        setData,
    } = useAsync()

    React.useEffect(() => {
        run(getUser())
    }, [run])

    const login = form => auth.login(form).then(user => setData(user))
    const register = form => auth.register(form).then(user => setData(user))
    const logout = () => {
        auth.logout()
        setData(null)
    }

    if (isLoading || isIdle) {
        return <FullPageSpinner />
    }

    if (isError) {
        return <FullPageErrorFallback error={error} />
    }

    if (isSuccess) {
        const value = { user, login, register, logout }
        return <AuthContext.Provider value={value} {...props} />
    }
}


function useAuth() {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error(`useAuth must be used within an AuthProvider`)
    }
    return context
}

export { AuthProvider, useAuth }