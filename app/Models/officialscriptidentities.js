'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OfficialScriptIdentities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OfficialScriptIdentities.init({
    Id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    Content: DataTypes.TEXT,
    Number: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'OfficialScriptIdentities',
    tableName: 'OfficialScriptIdentities',
    timestamps: false,
  });
  return OfficialScriptIdentities;
};