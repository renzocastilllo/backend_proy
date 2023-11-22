'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class recurso extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  recurso.init({
    nombre: DataTypes.STRING,
    titulo: DataTypes.STRING,
    serie: DataTypes.STRING,
    ISBN: DataTypes.INTEGER,
    autor: DataTypes.INTEGER,
    editor: DataTypes.STRING,
    descripcion: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'recurso',
  });
  return recurso;
};