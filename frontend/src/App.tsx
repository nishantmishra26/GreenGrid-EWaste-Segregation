import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Detect from './pages/Detect'
import Guide from './pages/Guide'
import Chat from './pages/Chat'
import About from './pages/About'
import Toaster from './components/ui/Toaster'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/detect" element={<Detect />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App