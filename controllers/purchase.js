require('dotenv').config();
const razorPay = require('razorpay');
const Order = require('../models/orders');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');
const secretKey = process.env.secretKey;


function generateToken(id, isPremium) {
    return jwt.sign({userId: id, premium: isPremium}, secretKey)
}

exports.premiumMembership =  async (req, res) => {
    

    
    try {
        
        var rzp = new razorPay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        } )
       
       
        const amount = 99900;  
        
        rzp.orders.create({amount, currency: "INR"}, async (err, orderData) => {
            if(err) {
                throw new Error(err);
                
            }
             await req.user.createOrder({orderId: orderData.id, status:'Pending'});
    
           try {
           
            return res.status(201).json({order:orderData, key_id: rzp.key_id});
            
           } catch (err ) {
            console.log(err);
            
           }
        })
        
    } catch (error) {
        console.log(error);
        res.status(403).json({message: 'Something went wwrong', error:error})
        
    }
}

exports.updatetransactionstatus = async (req, res) =>  {

 try {
        const orderId = req.body.order_id;
        const paymentId = req.body.payment_id;
        const token = req.headers.authorization;

        const t =  await sequelize.transaction();
         const order =  await  Order.findOne({where: {orderId:orderId}, transaction:t})
         const id = order.userId;
         if(!order) {
            await t.rollback();
            return res.status(404).json({ error: 'Order not found' });
         }


        
         if (paymentId===null) {
            await order.update({ paymentId: paymentId, status: 'FAILED' }, {transaction:t});
            await t.commit();
            return res.status(400).json({ success: false, message: 'Transaction failed' });
           
          } else {
            await order.update({ paymentId: paymentId, status: 'SUCCESSFUL' }, {transaction:t});
            const isPremium = true;
            const newToken = generateToken(id, isPremium);
            
            await t.commit();
            return res.status(202).json({ success: true, message: 'Transaction successful', token: newToken });
            
          }
      }
     catch (error) {
        console.log(error);
        t.rollback();
        res.status(401).json({error: error, message: 'Something went wwrong'});
        
    }
}


