const mongoose = require('mongoose')

const CoversationSchema = new mongoose.Schema({
    members:{
        type: Array,
    },
  
},
{timestamps: true}
);

module.exports = mongoose.model("Conversation", CoversationSchema);
