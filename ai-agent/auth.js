const fs = require("fs");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const USERS_PATH = "./data/users.json";

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, "[]");
  return JSON.parse(fs.readFileSync(USERS_PATH));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

function signup(username, password) {
  const users = loadUsers();
  if (users.find((u) => u.username === username)) {
    console.log("\n❌ Username already exists.");
    return null;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: uuidv4(),
    username,
    password: hashedPassword,
  };
  users.push(newUser);
  saveUsers(users);
  console.log("\n✅ Signup successful!");
  return newUser;
}

function login(username, password) {
  const users = loadUsers();
  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    console.log("❌ Invalid username or password.");
    return null;
  }
  console.log("\n✅ Login successful!");
  return user;
}

module.exports = { signup, login };
