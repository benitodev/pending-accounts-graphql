import { gql } from "apollo-server-express";
import { GraphQLScalarType, Kind } from "graphql";

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    username: String!
    accounts: [Account]
  }

  type Bill {
    id: ID!
    howOwes: ID!
    user: ID!
    amount: Int
    account: Account!
    createdAt: Date!
  }

  type Account {
    id: ID!
    name: String
    bills: [Bill]
    belong_users: [ID]
    createdAt: Date!
  }

  type Description {
    id: ID!
    user: User!
    account: Account!
  }
  type Token {
    value: String!
    userLogged: String!
  }

  type Query {
    getUser(username: String, id: String): User!
    allUsers: [User]!
    findAccount(userSelected: String!): [Account]
  }

  type Msg {
    bool: Boolean!
    message: String!
  }

  type Mutation {
    createUser(username: String!, password: String!): User
    createAccount(chosenUser: String!, name: String!): Account
    createBill(amount: Int!, account: String!, howOwes: String!): Bill
    eliminateBill(billId: String!, accountId: String!): Msg
    eliminateAccount(id: String, billArray: [String]!, relatedUser: String): Msg
    editAccount(id: String!, name: String ): Account
    editBill(id: String!, amount: Int): Bill
    login(username: String!, password: String!): Token
  }
`;

export const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    return value.getTime();
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

export default typeDefs;
