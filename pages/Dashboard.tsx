import Navbar from "../components/Navigation/Navbar"


const Dashboard = () => {
  return (
    <div>
        <Navbar>
          <Navbar.Prev/>
          <Navbar.Prev goToUrl="/Settings">Settings</Navbar.Prev>
          <Navbar.Link goToUrl="/Contact">Contact</Navbar.Link>
        </Navbar>
    </div>
  )
}

export default Dashboard
