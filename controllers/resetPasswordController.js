const sequelize = require('../util/database');
const forgotPasswordRequest = require('../models/forgotPasswordRequest');
const User= require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.resetPasswordForm = async (req, res, next) => {
    const requestId = req.params.requestId;
    const password = req.body.password;
   

    try {
        const t= await sequelize.transaction();
       const request =  await forgotPasswordRequest.findOne({where: {id:requestId, isActive: true,}, transaction:t});
       if(!request) {
        await t.rollback();
           return res.status(401).json({ message: 'Request id is not available' });
       }
       const user = await User.findOne({where:{id:request.userId}, transaction:t})
       if(!user) {
        await t.rollback();
        return res.status(401).json({message:'User with password reset request is not available'})
       }    
       const hashedPassword = await bcrypt.hash(password, saltRounds);
       user.password = hashedPassword;

      await user.save({transaction:t});

      request.isActive = false;
      await request.save({transaction:t});

      await t.commit();

      return res.status(200).json({message:'Password Reset successfully'});
  } catch (error) {
        console.error('Error resettig password:', error);
        await t.rollback();

        return res.status(500).json({ message: 'Internal server error.' });
        
    }

}