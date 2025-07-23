import RestaurantDashboard from "../components/RestaurantDashboard";

import { Helmet } from 'react-helmet';

const RestaurantDashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Byte! Restaurant Dashboard – Manage Orders & Menu</title>
        <meta name="description" content="Restaurant partners can manage orders, update menus, and track deliveries with Byte! food delivery Nigeria." />
        <meta property="og:title" content="Byte! Restaurant Dashboard" />
        <meta property="og:description" content="Manage your restaurant's food delivery operations on Byte." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div>
        <RestaurantDashboard />
      </div>
    </>
  );
}

export default RestaurantDashboardPage;