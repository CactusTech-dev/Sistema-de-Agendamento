import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import BookingPage from './pages/BookingPage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:slug" element={<BookingPage />} />
        <Route path="/admin/:slug" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App