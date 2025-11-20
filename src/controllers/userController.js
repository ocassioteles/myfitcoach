const { prisma } = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        workoutTemplates: true,
        payments: true,
        _count: {
          select: {
            workoutSessions: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário deve ser um número válido'
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workoutTemplates: {
          include: {
            exerciseTemplates: true
          }
        },
        workoutSessions: {
          include: {
            workoutTemplate: true,
            exerciseLogs: true
          },
          orderBy: {
            date: 'desc'
          },
          take: 10 // Últimas 10 sessões
        },
        payments: {
          orderBy: {
            dueDate: 'desc'
          }
        },
        _count: {
          select: {
            workoutSessions: true,
            workoutTemplates: true
          }
        }
      }
    });
    
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
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Validações básicas
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      });
    }
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null
      }
    });
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário deve ser um número válido'
      });
    }
    
    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Se email está sendo alterado, verificar se não está em uso
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email }
      });
      
      if (emailInUse) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null })
      }
    });
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário deve ser um número válido'
      });
    }
    
    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Deletar usuário (Prisma vai cuidar das relações em cascata)
    await prisma.user.delete({
      where: { id: userId }
    });
    
    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};