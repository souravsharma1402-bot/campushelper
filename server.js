const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json({limit:"10mb"}));
app.use(cors());

// ================= SERVE FRONTEND =================
app.use(express.static(path.join(__dirname, "public")));

// ================= TEMP DATABASE =================
let users = [];
let pendingAdmins = [];
let posts = [];
let notifications = [];

// ================= AUTH SYSTEM =================

// SIGNUP
app.post("/signup",(req,res)=>{
    const {userId,password} = req.body;

    if(users.find(u=>u.userId===userId)){
        return res.json({success:false,message:"User exists"});
    }

    users.push({userId,password,role:"user"});
    res.json({success:true});
});

// LOGIN
app.post("/login",(req,res)=>{
    const {userId,password} = req.body;
   

    const user = users.find(u=>u.userId===userId && u.password===password);

    if(!user) return res.json({success:false});

    res.json({
        success:true,
        user:{
            userId:user.userId,
            role:user.role
        }
    });
});

// ADMIN REQUEST
app.post("/requestAdmin",(req,res)=>{
    const {userId,password} = req.body;

    pendingAdmins.push({userId,password});
    res.json({success:true,message:"Request sent"});
});

// APPROVE ADMIN (manual)
app.post("/approveAdmin",(req,res)=>{
    const {userId} = req.body;

    const index = pendingAdmins.findIndex(u=>u.userId===userId);
    if(index === -1) return res.json({success:false});

    const admin = pendingAdmins[index];
    users.push({...admin, role:"admin"});
    pendingAdmins.splice(index,1);

    res.json({success:true});
});

// ================= FORUM =================

// CREATE POST
app.post("/createPost",(req,res)=>{
    const {userId,text,image} = req.body;

    const post = {
        id: Date.now(),
        userId,
        text,
        image,
        likes:0,
        comments:[]
    };

    posts.unshift(post);
    res.json({success:true});
});

// GET POSTS
app.get("/getPosts",(req,res)=>{
    res.json(posts);
});

// LIKE
app.post("/likePost",(req,res)=>{
    const {id} = req.body;

    const post = posts.find(p=>p.id==id);
    if(post) post.likes++;

    res.json({success:true});
});

// COMMENT
app.post("/commentPost",(req,res)=>{
    const {id,userId,comment} = req.body;

    const post = posts.find(p=>p.id==id);
    if(post) post.comments.push({userId,comment});

    res.json({success:true});
});

// ================= NOTIFICATIONS =================

// GET
app.get("/notifications",(req,res)=>{
    res.json(notifications);
});

// POST
app.post("/notifications",(req,res)=>{
    const {text,date} = req.body;

    notifications.unshift({text,date});
    res.json({success:true});
});

// ================= DEFAULT ROUTE =================

// If no API matched → send index.html
app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"public","index.html"));
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log("Server running on port " + PORT);
});
