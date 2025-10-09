'use client'

import { Provider } from 'react-redux'
import { useEffect, useState } from 'react'
import { Spin } from 'antd'
import { store } from '@/store'
import { restoreSession } from '@/store/slices/authSlice'

interface ReduxProviderProps {
  children: React.ReactNode
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Restore session from localStorage/cookies on mount
    store.dispatch(restoreSession())
    setIsInitialized(true)
  }, [])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4">
            <p className="text-lg font-semibold text-gray-700">Loading Application...</p>
            <p className="text-sm text-gray-500 mt-1">Initializing your session</p>
          </div>
        </div>
      </div>
    )
  }

  return <Provider store={store}>{children}</Provider>
}
