/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 */

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Default value is true
      after: 'password' // Add 'active' field after the password
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'active')
  }
}
