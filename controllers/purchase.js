require('dotenv').config();
const razorPay = require('razorpay');
const Order = require('../models/orders');

exports.premiumMembership =  async (req, res) => {
    

    
    try {
        
        var rzp = new razorPay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        } )
       
       
        const amount = 2500;  
        
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
         const order =  await  Order.findOne({where: {orderId:orderId}})
         if(!order) {
            return res.status(404).json({ error: 'Order not found' });
         }


        
         if (paymentId===null) {
            await order.update({ paymentId: paymentId, status: 'FAILED' });
            return res.status(400).json({ success: false, message: 'Transaction failed' });
           
          } else {
            await order.update({ paymentId: paymentId, status: 'SUCCESSFUL' });
            return res.status(202).json({ success: true, message: 'Transaction successful' });
            
          }
      }
     catch (error) {
        console.log(error);
        res.status(401).json({error: error, message: 'Something went wwrong'});
        
    }
}


