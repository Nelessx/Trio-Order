import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import OurMenu from '../../components/OurMenu/OurMenu'

const Menu = () => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Get search query from navigation state
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery)
    }
  }, [location.state])

  return (
    <>
      <Navbar/>
      <OurMenu searchQuery={searchQuery} />
      <Footer />
    </>
  )
}

export default Menu
