const { prisma } = require('../config/database');

// === SEGUIR USUÁRIOS ===

// Seguir um usuário
const followUser = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    
    if (!followerId || !followingId) {
      return res.status(400).json({
        success: false,
        message: 'IDs do seguidor e seguido são obrigatórios'
      });
    }
    
    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não pode seguir a si mesmo'
      });
    }
    
    // Verificar se usuários existem
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(followerId) } }),
      prisma.user.findUnique({ where: { id: parseInt(followingId) } })
    ]);
    
    if (!follower || !following) {
      return res.status(404).json({
        success: false,
        message: 'Um ou ambos os usuários não foram encontrados'
      });
    }
    
    // Verificar se já segue
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: parseInt(followerId),
          followingId: parseInt(followingId)
        }
      }
    });
    
    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: 'Usuário já está sendo seguido'
      });
    }
    
    const follow = await prisma.follow.create({
      data: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId)
      },
      include: {
        follower: { select: { id: true, name: true, email: true } },
        following: { select: { id: true, name: true, email: true } }
      }
    });
    
    res.status(201).json({
      success: true,
      data: follow,
      message: 'Usuário seguido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Parar de seguir um usuário
const unfollowUser = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    
    const deletedFollow = await prisma.follow.deleteMany({
      where: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId)
      }
    });
    
    if (deletedFollow.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Relacionamento de seguir não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuário deixou de ser seguido'
    });
  } catch (error) {
    console.error('Erro ao parar de seguir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar seguidores de um usuário
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const followers = await prisma.follow.findMany({
      where: { followingId: parseInt(userId) },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            avatar: true,
            _count: {
              select: {
                followers: true,
                following: true,
                workoutSessions: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: followers.map(f => f.follower),
      total: followers.length
    });
  } catch (error) {
    console.error('Erro ao buscar seguidores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar quem o usuário está seguindo
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const following = await prisma.follow.findMany({
      where: { followerId: parseInt(userId) },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            avatar: true,
            _count: {
              select: {
                followers: true,
                following: true,
                workoutSessions: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: following.map(f => f.following),
      total: following.length
    });
  } catch (error) {
    console.error('Erro ao buscar seguindo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// === COMENTÁRIOS ===

// Adicionar comentário em treino
const addWorkoutComment = async (req, res) => {
  try {
    const { userId, workoutSessionId, content } = req.body;
    
    if (!userId || !workoutSessionId || !content) {
      return res.status(400).json({
        success: false,
        message: 'UserId, workoutSessionId e content são obrigatórios'
      });
    }
    
    // Verificar se sessão de treino existe e é pública
    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id: parseInt(workoutSessionId) },
      include: { user: { select: { id: true, name: true } } }
    });
    
    if (!workoutSession) {
      return res.status(404).json({
        success: false,
        message: 'Sessão de treino não encontrada'
      });
    }
    
    if (!workoutSession.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Não é possível comentar em treinos privados'
      });
    }
    
    const comment = await prisma.workoutComment.create({
      data: {
        userId: parseInt(userId),
        workoutSessionId: parseInt(workoutSessionId),
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comentário adicionado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar comentários de um treino
const getWorkoutComments = async (req, res) => {
  try {
    const { workoutSessionId } = req.params;
    
    const comments = await prisma.workoutComment.findMany({
      where: { workoutSessionId: parseInt(workoutSessionId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json({
      success: true,
      data: comments,
      total: comments.length
    });
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// === FEED DA COMUNIDADE ===

// Buscar treinos públicos da comunidade
const getCommunityFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const workoutSessions = await prisma.workoutSession.findMany({
      where: { 
        isPublic: true,
        completed: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true
          }
        },
        workoutTemplate: {
          select: {
            name: true,
            difficulty: true
          }
        },
        exerciseLogs: {
          include: {
            exerciseTemplate: {
              select: {
                name: true,
                targetWeight: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 3 // Últimos 3 comentários
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip: skip,
      take: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: workoutSessions,
      total: workoutSessions.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Erro ao buscar feed da comunidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// === COMPARATIVO DE EXERCÍCIOS ===

// Comparar desempenho entre dois usuários em um exercício
const compareExercisePerformance = async (req, res) => {
  try {
    const { user1Id, user2Id, exerciseName } = req.query;
    
    if (!user1Id || !user2Id || !exerciseName) {
      return res.status(400).json({
        success: false,
        message: 'user1Id, user2Id e exerciseName são obrigatórios'
      });
    }
    
    // Buscar logs dos dois usuários para o exercício específico
    const [user1Logs, user2Logs] = await Promise.all([
      prisma.exerciseLog.findMany({
        where: {
          workoutSession: { userId: parseInt(user1Id) },
          exerciseTemplate: { name: { contains: exerciseName } }
        },
        include: {
          exerciseTemplate: { select: { name: true } },
          workoutSession: { select: { date: true, user: { select: { name: true } } } }
        },
        orderBy: { timestamp: 'desc' },
        take: 10
      }),
      prisma.exerciseLog.findMany({
        where: {
          workoutSession: { userId: parseInt(user2Id) },
          exerciseTemplate: { name: { contains: exerciseName } }
        },
        include: {
          exerciseTemplate: { select: { name: true } },
          workoutSession: { select: { date: true, user: { select: { name: true } } } }
        },
        orderBy: { timestamp: 'desc' },
        take: 10
      })
    ]);
    
    // Calcular estatísticas
    const user1Stats = calculateStats(user1Logs);
    const user2Stats = calculateStats(user2Logs);
    
    res.json({
      success: true,
      data: {
        exerciseName,
        user1: {
          id: parseInt(user1Id),
          name: user1Logs[0]?.workoutSession?.user?.name || 'Usuário 1',
          stats: user1Stats,
          recentLogs: user1Logs.slice(0, 5)
        },
        user2: {
          id: parseInt(user2Id),
          name: user2Logs[0]?.workoutSession?.user?.name || 'Usuário 2',
          stats: user2Stats,
          recentLogs: user2Logs.slice(0, 5)
        },
        comparison: {
          maxWeightDifference: user1Stats.maxWeight - user2Stats.maxWeight,
          avgWeightDifference: user1Stats.avgWeight - user2Stats.avgWeight,
          totalVolumeComparison: user1Stats.totalVolume - user2Stats.totalVolume
        }
      }
    });
  } catch (error) {
    console.error('Erro ao comparar exercícios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Função auxiliar para calcular estatísticas
function calculateStats(logs) {
  if (logs.length === 0) {
    return {
      maxWeight: 0,
      avgWeight: 0,
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0
    };
  }
  
  const weights = logs.map(log => log.actualWeight || 0);
  const maxWeight = Math.max(...weights);
  const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
  const totalVolume = logs.reduce((total, log) => 
    total + (log.actualWeight || 0) * log.actualReps, 0
  );
  const totalSets = logs.length;
  const totalReps = logs.reduce((total, log) => total + log.actualReps, 0);
  
  return {
    maxWeight: Math.round(maxWeight * 100) / 100,
    avgWeight: Math.round(avgWeight * 100) / 100,
    totalVolume: Math.round(totalVolume * 100) / 100,
    totalSets,
    totalReps
  };
}

// Buscar usuários da comunidade (excluindo o usuário atual)
const getCommunityUsers = async (req, res) => {
  try {
    const { currentUserId, search } = req.query;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = {
      isPublic: true
    };
    
    // Excluir usuário atual se fornecido
    if (currentUserId) {
      whereClause.id = { not: parseInt(currentUserId) };
    }
    
    // Filtro de busca por nome
    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            workoutSessions: { where: { completed: true } },
            workoutTemplates: true
          }
        }
      },
      orderBy: [
        { followers: { _count: 'desc' } }, // Mais seguidos primeiro
        { createdAt: 'desc' }
      ],
      skip: skip,
      take: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: users,
      total: users.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Erro ao buscar usuários da comunidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  addWorkoutComment,
  getWorkoutComments,
  getCommunityFeed,
  compareExercisePerformance,
  getCommunityUsers
};
