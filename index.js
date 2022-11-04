let express=require("express");
let mongoose=require("mongoose")
let cors=require('cors')
let app=express();
let Stripe=require('stripe')
let stripe=Stripe("sk_test_51LrhVWSCStzcfhTCPS3M8457PxMS486x9ldPWK6BTajkFTVUvwNWX8idtSAiA7ZGMpQ8BQ2KhDEC5H4hLP71rSsO00bC9Uo0l2")
let socket=require("socket.io");
let PORT=9000;
let signInModel=require("./model/model-schema")
let dbURL="mongodb+srv://default-user:default123@firstevercluster.jsitxrg.mongodb.net/?retryWrites=true&w=majority"
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cors())

mongoose.connect(dbURL)
.then(()=>{
    console.log("Database connected")
})
.catch((err)=>{
    console.log(err);
})


app.post("/register",(req,res)=>{
    let {name,email,password} = req.body
    signInModel.findOne({email:email},(err,user)=>{
        if(user){
            res.send({message:"User's already registered"})
        }
        else{
            const newUser=new signInModel({
                name,
                email,
                password
            })

            newUser.save()
            .then(doc=>{
                res.send({message:"User's registered, now you can login"})
            })
            .catch(err=>{
                console.log(err)
            })
        }
    })
})

app.post("/signin",(req,res)=>{
    let {email,password}=req.body;

    signInModel.findOne({email:email},(err,user)=>{
        if(user){
            if(user.password===password){
                res.send({message:"Login Successful, head over to the homepage!"})
            }
            else{
                res.send({message:"Wrong Credentials!"})
            }
        }
        else{
            res.send({message:"Wrong Credentials!"})
        }
    })
})

app.get("/",(req,res)=>{
    let db=mongoose.connection.db;
    db.collection("products").find().toArray((err,results)=>{
        if(err) throw err;
        res.send({allData:results})
    })
    console.log("API called")
})

app.post('/create-checkout-session', async (req, res) => {

    let line_items = req.body.map((item) => {
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.header
            },
            unit_amount: (item.rate/item.quantity) * 100,
          },
          quantity: item.quantity,
        };
      });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cart",
    });
  
    res.send({url:session.url});
  });


let server=app.listen(process.env.PORT || PORT)