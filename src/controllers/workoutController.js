const { prisma } = require('../config/database');

const getAllWorkouts = async (req, res) => {
  try {
    const workouts = await prisma.workoutTemplate.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        exerciseTemplates: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            workoutSessions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: workouts,
      total: workouts.length
    });
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const getWorkoutsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);
    
    if (isNaN(userIdInt)) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário deve ser um número válido'
      });
    }
    
    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userIdInt }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    const userWorkouts = await prisma.workoutTemplate.findMany({
      where: {
        userId: userIdInt
      },
      include: {
        exerciseTemplates: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            workoutSessions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: userWorkouts,
      total: userWorkouts.length
    });
  } catch (error) {
    console.error('Erro ao buscar treinos do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const workoutId = parseInt(id);
    
    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do treino deve ser um número válido'
      });
    }
    
    const workout = await prisma.workoutTemplate.findUnique({
      where: { id: workoutId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        exerciseTemplates: {
          orderBy: {
            order: 'asc'
          }
        },
        workoutSessions: {
          include: {
            exerciseLogs: true
          },
          orderBy: {
            date: 'desc'
          },
          take: 5 // Últimas 5 sessões
        },
        _count: {
          select: {
            workoutSessions: true
          }
        }
      }
    });
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Treino não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Erro ao buscar treino:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const createWorkout = async (req, res) => {
  try {
    const { name, description, difficulty, userId, exercises } = req.body;
    
    // Validações básicas
    if (!name || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Nome e ID do usuário são obrigatórios'
      });
    }
    
    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Validar dificuldade
    const validDifficulties = ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Dificuldade deve ser: INICIANTE, INTERMEDIARIO ou AVANCADO'
      });
    }
    
    const workout = await prisma.workoutTemplate.create({
      data: {
        name,
        description: description || null,
        difficulty: difficulty || 'INICIANTE',
        userId: parseInt(userId),
        exerciseTemplates: exercises ? {
          create: exercises.map((exercise, index) => ({
            name: exercise.name,
            targetSets: exercise.sets || 3,
            targetReps: exercise.reps || '10-12',
            targetWeight: exercise.weight ? parseFloat(exercise.weight) : null,
            restTime: exercise.restTime || 60,
            notes: exercise.notes || null,
            order: index + 1
          }))
        } : undefined
      },
      include: {
        exerciseTemplates: {
          orderBy: {
            order: 'asc'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: workout,
      message: 'Treino criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, difficulty } = req.body;
    const workoutId = parseInt(id);
    
    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do treino deve ser um número válido'
      });
    }
    
    // Verificar se treino existe
    const existingWorkout = await prisma.workoutTemplate.findUnique({
      where: { id: workoutId }
    });
    
    if (!existingWorkout) {
      return res.status(404).json({
        success: false,
        message: 'Treino não encontrado'
      });
    }
    
    // Validar dificuldade se fornecida
    const validDifficulties = ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Dificuldade deve ser: INICIANTE, INTERMEDIARIO ou AVANCADO'
      });
    }
    
    const updatedWorkout = await prisma.workoutTemplate.update({
      where: { id: workoutId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(difficulty && { difficulty })
      },
      include: {
        exerciseTemplates: {
          orderBy: {
            order: 'asc'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: updatedWorkout,
      message: 'Treino atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar treino:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const workoutId = parseInt(id);
    
    if (isNaN(workoutId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do treino deve ser um número válido'
      });
    }
    
    // Verificar se treino existe
    const existingWorkout = await prisma.workoutTemplate.findUnique({
      where: { id: workoutId }
    });
    
    if (!existingWorkout) {
      return res.status(404).json({
        success: false,
        message: 'Treino não encontrado'
      });
    }
    
    // Deletar treino (Prisma cuidará das relações em cascata)
    await prisma.workoutTemplate.delete({
      where: { id: workoutId }
    });
    
    res.json({
      success: true,
      message: 'Treino deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar treino:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getAllWorkouts,
  getWorkoutsByUserId,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout
};