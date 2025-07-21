const users = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-1234",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 99999-5678",
    createdAt: "2024-02-10T14:30:00Z"
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@email.com",
    phone: "(11) 99999-9012",
    createdAt: "2024-03-05T09:15:00Z"
  }
];

const workouts = [
  {
    id: 1,
    userId: 1,
    name: "Treino de Peito e Tríceps",
    description: "Focado em hipertrofia",
    duration: 60,
    difficulty: "intermediario",
    exercises: [
      { name: "Supino Reto", sets: 2, reps: "8-10", weight: 80 },
      { name: "Supino Inclinado", sets: 2, reps: "10-12", weight: 70 },
      { name: "Tríceps Pulley", sets: 2, reps: "12-15", weight: 30 }
    ]
  },
  {
    id: 2,
    userId: 2,
    name: "Treino de Pernas",
    description: "Quadríceps, glúteos e panturrilha",
    duration: 75,
    difficulty: "avancado",
    exercises: [
      { name: "Agachamento", sets: 2, reps: "6-8", weight: 100 },
      { name: "Leg Press", sets: 2, reps: "12-15", weight: 200 },
      { name: "Panturrilha", sets: 2, reps: "15-20", weight: 60 }
    ]
  }
];

const payments = [
  {
    id: 1,
    userId: 1,
    amount: 150.00,
    dueDate: "2024-06-15",
    paidDate: "2024-06-14",
    status: "paid"
  },
  {
    id: 2,
    userId: 2,
    amount: 150.00,
    dueDate: "2024-06-20",
    paidDate: null,
    status: "pending"
  },
  {
    id: 3,
    userId: 3,
    amount: 150.00,
    dueDate: "2024-06-10",
    paidDate: null,
    status: "overdue"
  }
];

module.exports = {
  users,
  workouts,
  payments
};