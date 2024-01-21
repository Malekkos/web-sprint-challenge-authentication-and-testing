// Write your tests here

const db = require("../data/dbConfig")
const request = require("supertest")
const server = require("./server")

test('sanity', () => {
  expect(true).not.toBe(false)
})


beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})


describe("[POST] register endpoint", () => {
  test("When provided valid details, a user is registered and created in the database", async () => {
    const newUser = {"username": "Patrick", "password": "134fv9r8YAF#HF#fdjffa"}
    const response = await request(server).post("/api/auth/register").send(newUser)
    expect(response.body.username).toBe("Patrick")
    const dbProof = await db("users").where("id", 1).first()
    expect(dbProof).toBeTruthy()
  })
  test("When provided details are missing a username, password, or both, responds with a certain message", async () => {
    let newUser = {"username": "Lemar"}
    let response = await request(server).post("/api/auth/register").send(newUser)
    const errorMessage = "username and password required"
    expect(response.body).toEqual(errorMessage)
    newUser = {"password": "quarbidy888"}
    response = await request(server).post("/api/auth/register").send(newUser)
    expect(response.body).toEqual(errorMessage)
    newUser = {}
    response = await request(server).post("/api/auth/register").send(newUser)
    expect(response.body).toEqual(errorMessage)
  })
  test("When provided details has a username that already exists, responds with a certain message", async () => {
    let newUser = {"username": "Luna", "password": "nineM00ns"}
    let response = await request(server).post("/api/auth/register").send(newUser)
    const errorMessage = "username taken"
    expect(response.body.username).toEqual("Luna")
    newUser = {"username": "Luna", "password": "M00nsst1nk"}
    response = await request(server).post("/api/auth/register").send(newUser)
    expect(response.body).toEqual(errorMessage)
  })
})