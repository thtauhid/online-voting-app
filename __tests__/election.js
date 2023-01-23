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

  test("Edit a question", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");
    let res = await agent.get("/elections/1/questions/new");
    let csrfToken = getCsrfToken(res.text);

    let response = await agent.post("/elections/1/questions").send({
      title: "Test Question",
      description: "Test Description",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);
    expect(response.header.location).toContain("/elections/1/questions/2");

    res = await agent.get("/elections/1/questions/2/edit");
    csrfToken = getCsrfToken(res.text);

    response = await agent.post("/elections/1/questions/2").send({
      title: "Test Question 2",
      description: "Test Description 2",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);
    expect(response.header.location).toContain("/elections/1/questions");

    // Checking if the question is edited
    response = await agent.get("/elections/1/questions");
    const $ = cherio.load(response.text);
    const firstListItem = $("#question-2")[0].children[0].data;

    expect(firstListItem).toContain("Test Question 2");
  });

  test("Delete a question", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");
    let res = await agent.get("/elections/1/questions/new");
    let csrfToken = getCsrfToken(res.text);

    let response = await agent.post("/elections/1/questions").send({
      title: "To Be Deleted Question",
      description: "Test Description",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);
    expect(response.header.location).toContain("/elections/1/questions/3");

    res = await agent.get("/elections/1/questions/new");
    csrfToken = getCsrfToken(res.text);

    response = await agent.delete("/elections/1/questions/3").send({
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(200);

    // Checking if the question is deleted
    response = await agent.get("/elections/1/questions");
    const $ = cherio.load(response.text);
    const firstListItem = $("#question-3")[0];

    expect(firstListItem).toBe(undefined);
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
    const firstListItem = $("#option-1")[0].children[0].data;

    expect(firstListItem).toContain("Test Option");
  });

  test("Edit a option in question", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");
    let res = await agent.get("/elections/1/questions/1/options/new");
    let csrfToken = getCsrfToken(res.text);

    let response = await agent.post("/elections/1/questions/1/options").send({
      title: "Test Option",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);

    res = await agent.get("/elections/1/questions/1/options/1/edit");
    csrfToken = getCsrfToken(res.text);

    response = await agent.post("/elections/1/questions/1/options/1").send({
      title: "Test Option 2",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);

    // Checking if the option is edited
    response = await agent.get("/elections/1/questions/1");
    const $ = cherio.load(response.text);
    const firstListItem = $("#option-1")[0].children[0].data;

    expect(firstListItem).toContain("Test Option 2");
  });

  test("Delete a option in question", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");
    let res = await agent.get("/elections/1/questions/1/options/new");
    let csrfToken = getCsrfToken(res.text);

    let response = await agent.post("/elections/1/questions/1/options").send({
      title: "To Be Deleted Option",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);

    res = await agent.get("/elections/1/questions/1");
    csrfToken = getCsrfToken(res.text);

    response = await agent.delete("/elections/1/questions/1/options/2").send({
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(200);

    // Checking if the option is deleted from the question
    response = await agent.get("/elections/1/questions/1");
    const $ = cherio.load(response.text);
    const firstListItem = $("#option-2")[0];

    expect(firstListItem).toBe(undefined);
  });

  test("Launch an election", async () => {
    // Create new election
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");

    let res = await agent.get("/elections/new");
    let csrfToken = getCsrfToken(res.text);

    let response = await agent.post("/elections").send({
      title: "New Election",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
    expect(response.header.location).toContain("/elections");

    // Create new question
    res = await agent.get("/elections/2/questions/new");
    csrfToken = getCsrfToken(res.text);

    response = await agent.post("/elections/2/questions").send({
      title: "Test Question",
      description: "Test Description",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);
    expect(response.header.location).toContain("/elections/2/questions/4");

    // Create 2 new option
    res = await agent.get("/elections/2/questions/4/options/new");
    csrfToken = getCsrfToken(res.text);

    response = await agent.post("/elections/2/questions/4/options").send({
      title: "Test Option 1",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);

    res = await agent.get("/elections/2/questions/4/options/new");
    csrfToken = getCsrfToken(res.text);

    response = await agent.post("/elections/2/questions/4/options").send({
      title: "Test Option 2",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);

    // Launch the election

    res = await agent.get("/elections/new");
    csrfToken = getCsrfToken(res.text);

    response = await agent.put("/elections/2/launch").send({
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(200);

    // Checking if the election is launched
    response = await agent.get("/elections/2");

    expect(response.text).toContain("Your election is now live.");
  });

  test("Create Voter", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");
    let res = await agent.get("/elections/new");
    let csrfToken = getCsrfToken(res.text);

    let response = await agent.post("/elections/2/voters").send({
      voterId: "testVoter",
      password: "testPassword",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);

    // Checking if the voter is added to the election
    response = await agent.get("/elections/2/voters");
    const $ = cherio.load(response.text);
    const firstListItem = $("#voter-2_testVoter")[0].children[0].data;

    expect(firstListItem).toContain("2_testVoter");
  });

  test("Delete Voter", async () => {
    const agent = request.agent(server);
    await login(agent, "john.doe2@example.com", "password");
    let res = await agent.get("/elections/new");
    let csrfToken = getCsrfToken(res.text);

    let response = await agent.post("/elections/2/voters").send({
      voterId: "testVoter2",
      password: "testPassword",
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(302);

    res = await agent.get("/elections/new");
    csrfToken = getCsrfToken(res.text);

    response = await agent.delete("/elections/2/voters/2").send({
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(200);

    // Checking if the voter is deleted from the election
    response = await agent.get("/elections/2/voters");

    const $ = cherio.load(response.text);
    const firstListItem = $("#voter-2_testVoter2")[0];

    expect(firstListItem).toBe(undefined);
  });
});
