const user = require("../models/user");
const Expense = require("../models/expenses");
const sequelize = require("../util/database");

exports.addExpense = async (req, res, next) => {
  const { name, amount, category } = req.body;

  try {
    if (!name || !amount || !category) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const t = await sequelize.transaction();
    // console.log(req.user);
    const userId = req.user.id;

    const newExpense = await Expense.create(
      { name, amount, category, userId },
      { transaction: t }
    );
    const expenseUser = await user.findByPk(userId, { transaction: t });
    if (expenseUser) {
      expenseUser.totalExpenses += amount;
      await expenseUser.save({ transaction: t });
    }
    await t.commit();
    // console.log(newExpense);
    res.status(201).json({ newExpense });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.allExpenses = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { page = 1, itemsPerPage = 10 } = req.query;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const expenses = await Expense.findAll({
      where: { userId: id },
      limit: parseInt(itemsPerPage),
      offset: startIndex,
    });
    // console.log(expenses);
    const expenseUser = await user.findOne({ where: { id: id } });
    const totalExpense = expenseUser.totalExpenses;
    // console.log('nnnnnnn');
    // console.log(expenses);
    res.status(200).json({ expenses, totalExpense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Errorr" });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
    const t = await sequelize.transaction();
    const targetExpense = await Expense.findOne({
      where: { id: id },
      transaction: t,
    });
    // console.log(targetExpense);
    if (!targetExpense) {
      await t.rollback();
      return res.status(404).json({ error: "Expense not found" });
    }
    const deleteUser = await user.findOne({
      where: { id: targetExpense.userId },
      transaction: t,
    });
    deleteUser.totalExpenses -= targetExpense.amount;
    await deleteUser.save({ transaction: t });

    await targetExpense.destroy({ transaction: t });
    t.commit();
    res.status(200).json({ message: "Deleted succesfullly" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.editExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json({ expense });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, amount, category } = req.body;
    const t = await sequelize.transaction();

    const expense = await Expense.findByPk(id, { transaction: t });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ error: "Expense not found" });
    }
    const editUser = await user.findOne({
      where: { id: expense.userId },
      transaction: t,
    });
    editUser.totalExpenses -= expense.amount;

    expense.name = name;
    expense.amount = amount;
    expense.category = category;

    await expense.save({ transaction: t });
    editUser.totalExpenses += expense.amount;

    await editUser.save({ transaction: t });

    await t.commit();

    res.status(200).json({ message: "Expense updated successfully" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.showLeaderboard = async (req, res, next) => {
  try {
    const leaderboardData = await user.findAll({
      attributes: ["name", "totalExpenses"],
      order: [["totalExpenses", "DESC"]],
    });
    res.json(leaderboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
