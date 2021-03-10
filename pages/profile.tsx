import { AccessControl } from "accesscontrol";
import axios from "axios";
import { NextApiResponse, InferGetServerSidePropsType } from "next";
import { useQuery } from "react-query";
import { withComponentAuthRequired } from "../lib/p1Auth/utils/with-page-auth-factory";
import { UserDTO } from "../middleware/types";

const Profile = () => {
  const query = useQuery<UserDTO>("users", () =>
    axios
      .get("http://localhost:3000/api/login")
      .then((response) => response.data)
  );

  if (query.isLoading) {
    return <div>...Loading</div>;
  }

  const ac = new AccessControl(query.data?.grants);


  const isAdmin = ac.hasRole("admin");


  return (
    <div>
      <div>Your Profile</div>
      <pre>{JSON.stringify(query.data, null, 2)}</pre>
    </div>
  );
};

// export const getServerSideProps = async (context) => {

//   console.log('hello')
//   console.log(context.req.headers)

//   console.log(context.res.headers)

//   //In production will this have the JWT in the authorization header? YES!... I

//   return {
//     props: {
//       test: 'this is a test'
//     },
//   };
// };

export default withComponentAuthRequired(Profile);
