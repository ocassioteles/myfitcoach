const { prisma } = require('../config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes (opcional - cuidado em produção!)
    await prisma.exerciseComparison.deleteMany();
    await prisma.workoutComment.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.exerciseLog.deleteMany();
    await prisma.workoutSession.deleteMany();
    await prisma.exerciseTemplate.deleteMany();
    await prisma.workoutTemplate.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.user.deleteMany();

    // Criar usuários com dados sociais
    const users = await prisma.user.createMany({
      data: [
        {
          name: "João Silva",
          email: "joao@email.com",
          phone: "(11) 99999-1234",
          bio: "Apaixonado por musculação e vida saudável! 💪",
          avatar: null
        },
        {
          name: "Maria Santos",
          email: "maria@email.com",
          phone: "(11) 99999-5678",
          bio: "Corrida e funcional são minha paixão! 🏃‍♀️",
          avatar: null
        },
        {
          name: "Pedro Costa",
          email: "pedro@email.com",
          phone: "(11) 99999-9012",
          bio: "Crossfit e superação de limites! 🔥",
          avatar: null
        },
        {
          name: "Ana Oliveira",
          email: "ana@email.com",
          phone: "(11) 99999-3456",
          bio: "Yoga e pilates para o bem-estar! 🧘‍♀️",
          avatar: null
        },
        {
          name: "Carlos Mendes",
          email: "carlos@email.com",
          phone: "(11) 99999-7890",
          bio: "Powerlifting e força máxima! ⚡",
          avatar: null
        }
      ]
    });

    console.log(`✅ ${users.count} usuários criados`);

    // Buscar usuários criados para obter IDs
    const createdUsers = await prisma.user.findMany();

    // Criar templates de treino
    const workoutTemplate1 = await prisma.workoutTemplate.create({
      data: {
        name: "Treino de Peito e Tríceps",
        description: "Focado em hipertrofia",
        difficulty: "INTERMEDIARIO",
        userId: createdUsers[0].id,
        exerciseTemplates: {
          create: [
            {
              name: "Supino Reto",
              targetSets: 3,
              targetReps: "8-10",
              targetWeight: 80,
              restTime: 120,
              order: 1
            },
            {
              name: "Supino Inclinado",
              targetSets: 3,
              targetReps: "10-12",
              targetWeight: 70,
              restTime: 90,
              order: 2
            },
            {
              name: "Tríceps Pulley",
              targetSets: 3,
              targetReps: "12-15",
              targetWeight: 30,
              restTime: 60,
              order: 3
            }
          ]
        }
      }
    });

    const workoutTemplate2 = await prisma.workoutTemplate.create({
      data: {
        name: "Treino de Pernas",
        description: "Focado em força e resistência",
        difficulty: "AVANCADO",
        userId: createdUsers[1].id,
        exerciseTemplates: {
          create: [
            {
              name: "Agachamento",
              targetSets: 4,
              targetReps: "8-12",
              targetWeight: 100,
              restTime: 180,
              order: 1
            },
            {
              name: "Leg Press",
              targetSets: 3,
              targetReps: "12-15",
              targetWeight: 200,
              restTime: 120,
              order: 2
            },
            {
              name: "Panturrilha",
              targetSets: 4,
              targetReps: "15-20",
              targetWeight: 50,
              restTime: 60,
              order: 3
            }
          ]
        }
      }
    });

    console.log('✅ 2 templates de treino criados');

    // Criar sessões de treino (algumas públicas para o feed)
    const workoutSession1 = await prisma.workoutSession.create({
      data: {
        userId: createdUsers[0].id,
        workoutTemplateId: workoutTemplate1.id,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ontem
        duration: 65,
        notes: "Treino intenso! Consegui aumentar a carga no supino.",
        isPublic: true
      }
    });

    const workoutSession2 = await prisma.workoutSession.create({
      data: {
        userId: createdUsers[1].id,
        workoutTemplateId: workoutTemplate2.id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Anteontem
        duration: 75,
        notes: "Pernas destruídas! Melhor treino da semana.",
        isPublic: true
      }
    });

    const workoutSession3 = await prisma.workoutSession.create({
      data: {
        userId: createdUsers[2].id,
        workoutTemplateId: workoutTemplate1.id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: 60,
        notes: "Focando na técnica hoje.",
        isPublic: true
      }
    });

    console.log('✅ 3 sessões de treino criadas');

    // Criar logs de exercícios para as sessões
    const exerciseTemplates1 = await prisma.exerciseTemplate.findMany({
      where: { workoutTemplateId: workoutTemplate1.id },
      orderBy: { order: 'asc' }
    });

    // Logs para sessão 1 (Peito e Tríceps)
    for (const template of exerciseTemplates1) {
      for (let set = 1; set <= template.targetSets; set++) {
        await prisma.exerciseLog.create({
          data: {
            workoutSessionId: workoutSession1.id,
            exerciseTemplateId: template.id,
            setNumber: set,
            actualReps: set === 1 ? 10 : set === 2 ? 9 : 8,
            actualWeight: template.targetWeight,
            restTime: template.restTime,
            completed: true
          }
        });
      }
    }

    // Criar pagamentos (compatível com schema atual)
    console.log('Criando pagamentos...');
    await prisma.payment.createMany({
      data: [
        {
          userId: createdUsers[0].id,
          amount: 29.9,
          dueDate: new Date(),
          paidDate: new Date(),
          status: 'PAID'
        },
        {
          userId: createdUsers[1].id,
          amount: 29.9,
          dueDate: new Date(),
          paidDate: new Date(),
          status: 'PAID'
        },
        {
          userId: createdUsers[2].id,
          amount: 29.9,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          paidDate: null,
          status: 'PENDING'
        }
      ]
    });

    // === DADOS SOCIAIS ===
    
    // Criar relacionamentos de seguir
    console.log('Criando relacionamentos de seguir...');
    await prisma.follow.createMany({
      data: [
        { followerId: createdUsers[0].id, followingId: createdUsers[1].id },
        { followerId: createdUsers[0].id, followingId: createdUsers[2].id },
        { followerId: createdUsers[1].id, followingId: createdUsers[0].id },
        { followerId: createdUsers[1].id, followingId: createdUsers[2].id },
        { followerId: createdUsers[2].id, followingId: createdUsers[0].id },
        { followerId: createdUsers[3].id, followingId: createdUsers[0].id },
        { followerId: createdUsers[3].id, followingId: createdUsers[1].id },
        { followerId: createdUsers[4].id, followingId: createdUsers[0].id },
        { followerId: createdUsers[4].id, followingId: createdUsers[2].id }
      ]
    });

    // Criar comentários em treinos
    console.log('Criando comentários em treinos...');
    await prisma.workoutComment.createMany({
      data: [
        {
          userId: createdUsers[1].id,
          workoutSessionId: workoutSession1.id,
          content: 'Parabéns pelo treino! 💪 Que dedicação!'
        },
        {
          userId: createdUsers[2].id,
          workoutSessionId: workoutSession1.id,
          content: 'Inspirador! Vou tentar esse treino também.'
        },
        {
          userId: createdUsers[0].id,
          workoutSessionId: workoutSession2.id,
          content: 'Excelente performance no agachamento! 🔥'
        },
        {
          userId: createdUsers[3].id,
          workoutSessionId: workoutSession2.id,
          content: 'Treino pesado! Parabéns pela evolução.'
        },
        {
          userId: createdUsers[4].id,
          workoutSessionId: workoutSession3.id,
          content: 'Que treino incrível! Me motiva a treinar mais.'
        },
        {
          userId: createdUsers[0].id,
          workoutSessionId: workoutSession3.id,
          content: 'Ótima técnica! 👏'
        }
      ]
    });

    // Criar comparações de exercícios (compatível com schema atual)
    console.log('Criando comparações de exercícios...');
    await prisma.exerciseComparison.createMany({
      data: [
        {
          user1Id: createdUsers[0].id,
          user2Id: createdUsers[1].id,
          exerciseName: 'Supino Reto'
        },
        {
          user1Id: createdUsers[0].id,
          user2Id: createdUsers[2].id,
          exerciseName: 'Supino Reto'
        }
      ]
    });

    console.log('✅ 3 pagamentos criados');
    console.log('✅ 9 relacionamentos de seguir criados');
    console.log('✅ 6 comentários em treinos criados');
    console.log('✅ 2 comparações de exercícios criadas');

    // Estatísticas finais
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.workoutTemplate.count(),
      prisma.exerciseTemplate.count(),
      prisma.workoutSession.count(),
      prisma.exerciseLog.count(),
      prisma.payment.count(),
      prisma.follow.count(),
      prisma.workoutComment.count(),
      prisma.exerciseComparison.count()
    ]);

    console.log('\\n📊 Estatísticas do banco de dados:');
    console.log(`👥 Usuários: ${stats[0]}`);
    console.log(`🏋️ Templates de treino: ${stats[1]}`);
    console.log(`💪 Templates de exercício: ${stats[2]}`);
    console.log(`📅 Sessões de treino: ${stats[3]}`);
    console.log(`📝 Logs de exercício: ${stats[4]}`);
    console.log(`💳 Pagamentos: ${stats[5]}`);
    console.log(`👥 Relacionamentos: ${stats[6]}`);
    console.log(`💬 Comentários: ${stats[7]}`);
    console.log(`📊 Comparações: ${stats[8]}`);

    console.log('\\n🎉 Seed do banco de dados concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro no seed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
