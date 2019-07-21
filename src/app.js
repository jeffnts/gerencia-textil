import React, { useContext} from 'react'

import { Routes } from './views/routes'

import { LoadedPageProvider } from './views/store'

const App = () => {
  return (
    <LoadedPageProvider>
      <Routes/>
    </LoadedPageProvider>
  )
}

export default App
