import { PrismaClient, User } from "@prisma/client"
import { createMocks } from "node-mocks-http"
import { userApi } from "../../../pages/api/user"

const userTest = {
name: "Bob"
}


// const mockPrismaClient = (mockTypename, mockFNName , mockObjectToReturn) => {
  
  jest.mock('@prisma/client', () => {
    return {
      PrismaClient: function() {
        return null
      }
    }
  })
  // const mockPrismaClient = jest.mock('@prisma/client', ()=>{
  //   return {
  //     PrismaClient: function() {
  //       return {
  //         user: {
  //           create: jest.fn(() : Partial<User> => {
  //             return  {name: "Bob", id: 1}//mockObjectToReturn
  //           }) 
  //         },
  //       };
  //     },
  //   };
  // });
// }

// mockPrismaClient('user', 'create', {...userTest, id: 1})

// const mockPrisma = mockPrismaClient
test('ThingTest', async () => {
  // mockPrisma.mockImplementationOnce(() => ({user: {create: jest.fn(() => ({name:'Bob', id:1}))}}))

  const {req,res} = createMocks({
    method:'POST',
    body: userTest
  })
  await userApi(req,res)

  const expectedUser = {...userTest, id:1}

  expect(res._getStatusCode()).toBe(200)
  expect(JSON.parse(res._getData())).toEqual(expectedUser)
})

test('api/user:POST--ID must be null', async () => {
  const {req, res} = createMocks({
    method:'POST',
    body: {...userTest, id:1}
  })
  await userApi(req,res)

  const expectedUserError = "ID must be null"


    expect(res._getStatusCode()).toBe(400)
    expect(res._getData()).toEqual(expectedUserError)
})

test('api/user:GET --Method not allowed', async () => {
  const {req, res} = createMocks({
    method:'GET',
    // body: {...userTest, id:1}
  })
  await userApi(req,res)

  const expectedUserError = "Method GET Not Allowed"


    expect(res._getStatusCode()).toBe(405)
    expect(res._getData()).toEqual(expectedUserError)
})

