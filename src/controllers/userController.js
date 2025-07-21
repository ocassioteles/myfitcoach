const { users } = require('../../data/mockData');

const getAllUsers = (req, res) => {
  res.json({
    success: true,
    data: users,
    total: users.length
  });
};

const getUserById = (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === parseInt(id));
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado'
    });
  }
  
  res.json({
    success: true,
    data: user
  });
};

module.exports = {
  getAllUsers,
  getUserById
};