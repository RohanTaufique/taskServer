const mongoose = require("mongoose");
let uuidv1 = require('uuidv1');
const crypto = require('crypto');
const { ObjectId } = mongoose.Schema;


const userSchema = new mongoose.Schema({

      name: {
            type: String,
            trim: true
      },
      email: {
            type: String,
            trim: true,
            require: true
      },

      hashed_password: {
            type: String
      },
      salt: String,
      created: {
            type: Date,
            default: Date.now
      },

      resetPasswordLink: {
            type: String,
            default: ''
      },
      emailVerficationCode: {
            type: String,
            unique: true
      },

      status: {
            type: String,
            enum: ['Pending', 'Active'],
            default: 'Pending'
      },
      tasks: [{
            title: String,
            description: String,
            createdAt: {
                type: Date,
                default: Date.now
            },
          
    
        },],
     
});


//virtual field
userSchema.virtual('password')
      .set(function (password) {
            //create temporary variable called _password
            this._password = password
            //generate a timestamp
            this.salt = uuidv1()
            //  encryptPassword()
            this.hashed_password = this.encryptPassword(this._password)
      })
      .get(function () {
            return this._password
      })

//methods
userSchema.methods = {


      encryptPassword: function (password) {
            if (!password) return "";
            try {
                  return crypto.createHmac('sha1', this.salt)
                        .update(password)
                        .digest('hex');
            } catch (err) {
                  return "";
            }
      },
      authenticate: function (plainText) {
            return this.encryptPassword(plainText) === this.hashed_password
      }

}


module.exports = mongoose.model("User", userSchema);