import { AccessControl } from "accesscontrol";
import axios from "axios";
import { useQuery } from "react-query";
import { UserDTO } from "../middleware/types";

const Profile = (props) => {
  const query = useQuery<UserDTO>("users", () =>
    axios
      .get("http://localhost:9000/api/login")
      .then((response) => response.data)
  );

  if (query.isLoading) {
    return <div>...Loading</div>;
  }

  const ac = new AccessControl(query.data?.grants)

  const isAdmin = ac.hasRole('admin');

  console.log('User is a admin', isAdmin)

  return (
    <div>
      <div>Your Profile</div>
      <pre>{JSON.stringify(query.data, null, 2)}</pre>
    </div>
  );
};

export default Profile;
