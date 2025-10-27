const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");
const User = require("./user");

const Download = sequelize.define("Download", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    fileURL: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

User.hasMany(Download, { foreignKey: "userId" });
Download.belongsTo(User, { foreignKey: "userId" });

module.exports = Download;
