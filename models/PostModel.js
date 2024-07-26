import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    replies: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        text: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }, {
    _id: true
  });

const postSchema = new Schema({
    text: {
        type: String,
        trim: true
    },
    images: {
        type: String,
        trim: true,
    },
    videos: {
    type: String,
    trim: true,
  },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      dislikes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      comments: [commentSchema]
},
{
    timestamps:true,
    versionKey:false,
    
  });

export default mongoose.model("Post",postSchema);