import { createMocks } from "node-mocks-http"
import userHandler from "../[id]"
const usertest = {
  id: 123,
  name: "me"
}

jest.mock('@prisma/client', ()=>{
    return {
      PrismaClient: function() {
        return {
          user: {
            findUnique: jest.fn(() => {return {...usertest}}),
            update: jest.fn(),
          },
        };
      },
    };
  });

  test('api/user:GET', async () => {
    const {req,res} = createMocks({
      method:'GET',
      query: {
        id: 1
      }
    })
    await userHandler(req,res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(usertest)
  })
  