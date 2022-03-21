const db = require('../../util/db');
const User = require('../../user_components/models/user.model');
const Post = require('./post.model');
const { Sequelize,DataTypes,Deferrable } = require('sequelize');

const PostReact = db.define('PostReacts',{
    user_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        references: {
            model: User,
            key: 'id',
            deferrable: Deferrable.INITIALLY_IMMEDIATE
        }
    },
    post_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        references: {
            model: Post,
            key: 'id',
            deferrable: Deferrable.INITIALLY_IMMEDIATE
        }
    },
},
{     
    index: [
        {
            name: 'index_postr1',
            fields: ['user_id']
        },{
            name: 'index_postr2',
            fields: ['post_id']
        }],
    timestamps: false,
    underscored: true
});

// PostReact.sync({ force: false });
module.exports = PostReact;
