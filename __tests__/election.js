const request = require("supertest");
const cherio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;

function getCsrfToken(html) {
  const $ = cherio.load(html);
  return $("input[name=_csrf]").val();
}

const login = async (agent, email, password) => {
  let res = await agent.get("/auth/login");
  let csrfToken = getCsrfToken(res.text);
  return agent.post("/auth/session").send({
    email,
    password,
    _csrf: csrfToken,
  });
};

describe("Election", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3690, () => {});
    agent = request.agent(server);

    // Create a new user
    // Temporary solution
    // Need to find a better way to do this
    const response = await agent.get("/auth/signup");
    const csrfToken = getCsrfToken(response.text);
    const user = {
      name: "John Doe 2",
      email: "john.doe2@example.com",
      password: "password",
    };
    await agent.post("/auth/user").send({ ...user, _csrf: csrfToken });
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Create a new election", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");

    let res = await agent.get("/elections/new");
    let csrfToken = getCsrfToken(res.text);

    const response = await agent.post("/elections").send({
      title: "Test Election",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
    expect(response.header.location).toContain("/elections/");
  });

  test("Create a question", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");
    let res = await agent.get("/elections/1/questions/new");
    let csrfToken = getCsrfToken(res.text);

    const response = await agent.post("/elections/1/questions").send({
      title: "Test Question",
      description: "Test Description",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);
    expect(response.header.location).toContain("/elections/1/questions/1");
  });

  test("Create a option in question", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");
    let res = await agent.get("/elections/1/questions/1/options/new");
    let csrfToken = getCsrfToken(res.text);

    let response = await agent.post("/elections/1/questions/1/options").send({
      title: "Test Option",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);

    // Checking if the option is added to the question
    response = await agent.get("/elections/1/questions/1");
    const $ = cherio.load(response.text);
    const firstListItem = $("ul > li")[0].children[0].data;

    expect(firstListItem).toContain("Test Option");
  });
});
