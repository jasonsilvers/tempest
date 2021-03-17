import Navbar from '../components/Navigation/Navbar';

const Dashboard = () => {
  return (
    <div>
      <h1>DashBoard</h1>
      <Navbar>
        <Navbar.Link goToUrl="/Profile">Profile</Navbar.Link>
        <Navbar.Link goToUrl="/Settings">Settings</Navbar.Link>
        <Navbar.Link goToUrl="/Contact">Contact</Navbar.Link>
      </Navbar>
    </div>
  );
};

export default Dashboard;
