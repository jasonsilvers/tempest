import React from "react"
import Navbar from "../components/Navigation/Navbar"

const Profile = () => {
  return (
    <Navbar>
    <Navbar.Link goToUrl="/Dashboard">Dashboard</Navbar.Link>
    <Navbar.Link goToUrl="/Profile">Profile</Navbar.Link>
    <Navbar.Link goToUrl="/Settings">Settings</Navbar.Link>
    <Navbar.Link goToUrl="/Contact">Contact</Navbar.Link>
  </Navbar>
  )
}

export default Profile
