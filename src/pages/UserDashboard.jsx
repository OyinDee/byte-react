import CombinedPage from "../components/UserDashboard";
import { Helmet } from 'react-helmet';

const UserDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Byte! User Dashboard – Your Orders & Account</title>
        <meta name="description" content="View your orders, manage your account, and access exclusive campus offers with Byte! food delivery Nigeria." />
        <meta property="og:title" content="Byte! User Dashboard" />
        <meta property="og:description" content="Manage your food orders and account with Byte, Nigeria's university delivery app." />
        <meta property="og:type" content="website" />
      </Helmet>
      <CombinedPage />
    </>
  );
};

export default UserDashboard;
