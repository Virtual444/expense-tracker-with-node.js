const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Expense = require('../models/expenses');
const User = require('../models/user');
const DownloadHistory = require('../models/downloadHistory'); 
const sequelize = require('../util/database');
const { v4: uuidv4 } = require('uuid');


AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_SECRET,
  region: process.env.REGION,
});

const s3 = new AWS.S3();


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'expense-tracker-with-nodejs',
    key: function (req, file, cb) {
      cb(null, 'expense-reports/' + Date.now() + '-' + file.originalname);
    },
  }),
});

exports.downloadExpense = async (req, res, next) => {
  try {
   
    const t =await sequelize.transaction();
    const user = await User.findByPk((req.user.id), {transaction:t});
    if(!user) {
        await t.rollback();
        return res.status(401).json({message: 'User not found'});
    } 

    const expenses = await Expense.findAll({where:{ userId: user.id }, transaction:t});
   
    const fileName = `expenses-${uuidv4()}.txt`;

       const expenseText = expenses
      .map((expense) => `${expense.name} -- $${expense.amount} -- ${expense.category}`)
      .join('\n');

   
    const params = {
      Bucket: 'expense-tracker-with-nodejs',
      Key: fileName,
      Body: expenseText,
      ContentType: 'text/plain',
    };

       await s3.upload(params).promise();

    const downloadParams = {
      Bucket: 'expense-tracker-with-nodejs',
      Key: params.Key, 
    };
    
   
    const fileUrl = s3.getSignedUrl('getObject', downloadParams);
   
   
 const downloadRecord = await DownloadHistory.create({
   userId: user.id,
   fileUrl: params.Key, 
   downloadedAt: new Date(),
     downloadedFileUrl: fileUrl, 
 });
   
 res.setHeader('Content-Disposition', `attachment; filename=expenses.txt`);
 res.setHeader('Content-Type', 'text/plain');


 res.send(expenseText);
  } catch (error) {
    console.error('An error occurred:', error);
    if (t) await t.rollback();
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.showDownloadHistory = async (req, res, next) => {
  try {
    const t = await sequelize.transaction();
    const downloadHistory = await DownloadHistory.findAll({
      where: { userId: req.user.id }, 
      order: [['downloadedAt', 'DESC']],
      transaction:t, 
    });
    await t.commit();
    res.json(downloadHistory);
  } catch (error) {
    console.error('Error fetching download history:', error);
    if (t) await t.rollback();
    res.status(500).json({ error: 'Internal server error' });
  }
}

















