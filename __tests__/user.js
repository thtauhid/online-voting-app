const request = require("supertest");
const cherio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;

function getCsrfToken(html) {
  const $ = cherio.load(html);
  return $("input[name=_csrf]").val();
}

describe("User", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3690, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up a new user", async () => {
    const response = await agent.get("/signup");
    const csrfToken = getCsrfToken(response.text);
    const user = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
    };
    const res = await agent.post("/user").send({ ...user, _csrf: csrfToken });
    expect(res.status).toBe(200);
  });

  test("User Login", async () => {
    const response = await agent.get("/login");
    const csrfToken = getCsrfToken(response.text);
    const user = {
      email: "john.doe@example.com",
      password: "password",
    };
    const res = await agent
      .post("/session")
      .send({ ...user, _csrf: csrfToken });
    expect(res.status).toBe(302);
    expect(res.header.location).toContain("/admin");
  });

  test("User Logout", async () => {
    const res = await agent.get("/logout");
    expect(res.status).toBe(302);
    expect(res.header.location).toContain("/login");
  });
});
