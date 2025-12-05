import { useState } from 'react'
import Feed from './pages/Feed'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Feed />
    </>
  )
}

export default App
