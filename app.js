import "./config.js";
import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./typeDefs.js";
import resolvers from "./resolvers.js";
import connectDB from "./db.js";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
const app = express();
app.use(cors());

connectDB();

app.get("/", (req, res) => res.send("welcome to my api"));

const start = async () => {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    cache: "bounded",
    csrfPrevention: true,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.toLowerCase().startsWith("bearer ")) {
        const token = auth.substring(7);
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const currentUser = await User.findById(decodedToken.id);
        return { currentUser };
      }
      return null;
    },
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.get("*", (req, res) => res.status(404).send("not found"));
  app.listen({ port: process.env.PORT || 4000 }, () => {
    console.log("Running server on port");
  });
};

start();
export default app;
