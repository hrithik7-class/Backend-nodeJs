import mongoose from "mongoose";
import mongooseAggregatePaginate 
from "mongoose-aggregate-paginate-v2";

const videoPlayerSchema = mongoose.Schema({
    videFile:{
         type:String,
         required:true,
         //coloudinary

    },
    thumbnail:{
        type:String,
        required:true,
        //colundinary
    },
    owner:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User"
    },
    title:{
         type:String,
         required:true,
    },
    description:{
         type:String,
         required:true, 
    },
    durstion:{
         type:Number,
         required:true,
    },
    viwes:{
         type:Number,
         default:0
    },
    isPublished:{
         type:Boolean,
         default:true

    },

},{timestamps:true})

videoPlayerSchema.plugin(mongooseAggregatePaginate) //aggregation pipelinning ...

export const Video = mongoose.model("Video",videoPlayerSchema)