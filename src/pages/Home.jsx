import Landing from "../components/Landing";
import Footer from "../components/Footer";
import { Helmet } from 'react-helmet';
import { BRAND_NAME } from "../utils/brandAssets";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>{BRAND_NAME} - Delicious Food Delivered to Your Door</title>
        <meta name="description" content="Order your favorite meals from local restaurants and get them delivered right to your door with Byte!" />
      </Helmet>
      <Landing />
      <Footer />
    </>
  );
};

export default Home;
