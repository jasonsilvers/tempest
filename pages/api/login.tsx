import { NextApiResponse } from "next";
import { NextAPIRequestWithAuthorization } from "../../lib/p1Auth/server/types/types";
import { UserDTO } from "../../middleware/types";

const login = async (
  req: NextAPIRequestWithAuthorization<UserDTO>,
  res: NextApiResponse<string>
) => {
  res.statusCode = 200;

  res.json('hello');
};

export default login;
