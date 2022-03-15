const db=require('../util/db');
const User=require('./user.model');
const Post=require('./post.model');
const { Sequelize,DataTypes,Deferrable } = require('sequelize');
const PostReact=db.define('PostReacts',{
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
<<<<<<< HEAD
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "id",
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  },
  {
=======
    user_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        references: {
            model: User,
            key: 'id',
            deferrable: Deferrable.INITIALLY_IMMEDIATE
        }
    }
},
{     
>>>>>>> 3165bfd42867f7cb562a5d81fbafa1805681ecb4
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

Post.hasMany(PostReact, {foreignKey : 'post_id'});
PostReact.belongsTo(Post,{ foreignKey: "user_id" });
User.hasMany(PostReact, {foreignKey : 'user_id'});
PostReact.belongsTo(User);

//PostReact.sync({ force: false });
module.exports=PostReact;
