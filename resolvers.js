import { AuthenticationError, UserInputError } from "apollo-server-express";
import { dateScalar } from "./typeDefs.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Account from "./models/Account.js";
import Bill from "./models/Bill.js";
const resolvers = {
  Date: dateScalar,
  Account: {
    id: (root) => root._id,
  },
  Bill: {
    id: (root) => root._id,
  },
  Query: {
    getUser: async (_, args) => {
      const user = await User.findOne({ _id: args.id });
      return user;
    },
    allUsers: async () => {
      const users = await User.find({}).populate("accounts", {
        name: 1,
      });

      return users;
    },
    findAccount: async (_, args, context) => {
      const { currentUser } = context;
      if (!currentUser) throw new AuthenticationError("not authenticated");
      const userSelectedId = args.userSelected;

      const account = await Account.find({
        belong_users: [userSelectedId, currentUser._id],
      }).populate("bills");
      return account;
    },
  },
  Mutation: {
    createUser: async (_, args) => {
      const password = args.password;
      try {
        if (!password || !args.username) throw new Error("missing data");
        const encryptedPassword = await bcrypt.hash(password, 10);
        const user = new User({ ...args, password: encryptedPassword });
        await user.save();
        return user;
      } catch (err) {
        throw new UserInputError(err.message, { invalidArgs: args });
      }
    },
    createAccount: async (root, args, context) => {
      const { currentUser } = context;
      if (!currentUser) throw new AuthenticationError("not authenticated");
      const userToMatch = args.chosenUser;
      const matchedUser = await User.findById(userToMatch);
      const account = new Account({
        name: args.name,
        belong_users: [matchedUser._id, currentUser._id],
        bills: [],
      });
      const savedAccount = await account.save();
      const user = await User.findById(currentUser.id);

      //concat account array of users

      matchedUser.accounts = matchedUser.accounts.concat(savedAccount.id);
      user.accounts = user.accounts.concat(savedAccount.id);

      await matchedUser.save();
      await user.save();
      return account;
    },
    createBill: async (_, args, context) => {
      const { currentUser } = context;
      if (!currentUser) throw new AuthenticationError("not authenticated");

      const accountId = args.account;
      const accountBelogings = await Account.findById(accountId);
      const userThatOwes = await User.findOne({ username: args.howOwes });

      const bill = new Bill({
        account: accountBelogings._id,
        howOwes: userThatOwes._id,
        user: currentUser._id,
        amount: parseInt(args.amount),
      });

      const savedBill = await bill.save();
      accountBelogings.bills = accountBelogings.bills.concat(savedBill.id);
      await accountBelogings.save();
      return bill;
    },
    eliminateBill: async (_, args, context) => {
      const { currentUser } = context;
      const billToDelete = args.billId;
      if (!currentUser) throw new AuthenticationError("not authenticated");
      try {
        const account = await Account.findById(args.accountId);
        const billDeleted = await Bill.findByIdAndDelete(billToDelete);
        let billToDeleteFromAccount = account.bills.find(
          (bill) => bill == billToDelete
        );

        if (billToDeleteFromAccount) {
          account.bills.pull(billToDeleteFromAccount);
          await account.save();
        }

        return {
          bool: true,
          message: "bill has been removed",
        };
      } catch (err) {
        return new Error({ err: err.message });
      }
    },
    eliminateAccount: async (_, args, context) => {
      const { currentUser } = context;
      if (!currentUser) throw new AuthenticationError("not authenticated");

      try {
        const accountId = args.id;
        const billArray = args.billArray;
        const billsDeleted = await Bill.deleteMany({ _id: billArray });

        const accountDeleted = await Account.findByIdAndDelete(accountId);
        if (!accountDeleted) throw new Error("This account doesn't exist");

        const relatedUser = await User.findById(args.relatedUser);
        const user = await User.findById(currentUser._id);
        let removeAccountFromRelatedUser = relatedUser.accounts.find(
          (account) => account == accountId
        );
        let removeAccountFromUser = user.accounts.find(
          (account) => account == accountId
        );
        if (removeAccountFromRelatedUser && removeAccountFromUser) {
          relatedUser.accounts.pull(removeAccountFromRelatedUser);
          user.accounts.pull(removeAccountFromUser);

          await relatedUser.save();
          await user.save();
        }
        return {
          bool: true,
          message: "Account has been removed",
        };
      } catch (err) {
        throw new Error("Error in", err);
      }
    },
    editAccount: async (_, args, context) => {
      const { currentUser } = context;
      if (!currentUser) throw new AuthenticationError("not authenticated");
      try {
        const { id, name } = args;
        const editedAccount = await Account.findByIdAndUpdate(
          id,
          { name },
          { new: true, runValidators: true }
        );
        return editedAccount;
      } catch (err) {
        return new Error({ err: err.message });
      }
    },
    editBill: async (_, args, context) => {
      const { currentUser } = context;
      if (!currentUser) throw new AuthenticationError("not authenticated");
      try {
        const { id, amount } = args;
        const bill = await Bill.findByIdAndUpdate(
          id,
          { amount },
          { new: true, runValidators: true }
        );
        return bill;
      } catch (err) {
        return new Error({ err: err.message });
      }
    },
    login: async (_, args) => {
      const user = await User.findOne({ username: args.username });
      const passwordCorrect = await bcrypt.compare(
        args.password,
        user.password
      );
      if (!user || !passwordCorrect) {
        throw new UserInputError("wrong credentials", {
          invalidArgs: args,
        });
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return {
        value: jwt.sign(userForToken, process.env.SECRET_KEY),
        userLogged: user.username,
      };
    },
  },
};

export default resolvers;
