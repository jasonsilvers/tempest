import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Navbar from '../components/Navigation/Navbar'
import NavItem from '../components/Navigation/NavItem'

export default function Home(props) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Tempest
        </h1>
        <Navbar>
          <Navbar.Link goToUrl="/Dashboard">Dashboard</Navbar.Link>
          <Navbar.Link goToUrl="/Profile">Profile</Navbar.Link>
          <Navbar.Link goToUrl="/Settings">Settings</Navbar.Link>
          <Navbar.Link goToUrl="/Contact">Contact</Navbar.Link>
        </Navbar>
      </main>
    </div>
  );
}
