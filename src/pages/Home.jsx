import Landing from "../components/Landing";
import Footer from "../components/Footer";
import { Helmet } from 'react-helmet';
// eslint-disable-next-line no-unused-vars
import { BRAND_NAME } from "../utils/brandAssets";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Byte! – Food Delivery Nigeria | Campus & City</title>
        <meta name="description" content="Byte! is Nigeria's leading food delivery app for students and city dwellers. Order food, discover restaurants, and enjoy fast delivery!" />
        <meta property="og:title" content="Byte! – Food Delivery Nigeria" />
        <meta property="og:description" content="Order food online with Byte, Nigeria's university and city delivery app." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Landing />
      <Footer />
    </>
  );
};

export default Home;
