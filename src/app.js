import cookieParser from "cookie-parser"
import cors  from "cors"
import express, { urlencoded } from "express"

const app =express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(urlencoded({extended:true , limit :"16kb"}))// in most of the cases we don't use the extended , it just mean like giving object inside object nesting inshort.
app.use(express.static("public")) // for local accessing the file that we stored , ex- images , favicon.
app.use(cookieParser())
// middleware is not just make middleware file , it is something like add some configuration
//  in your cors , or cookie parser or any thing that include bwtween you taking in between client and server
// for file uplaoding we use multer just like express.json() to handle javascript oject notation to javascipt 


//router
import userRouter from "./routers/user.route.js"


//routes
app.use('/api/v1/users',userRouter)