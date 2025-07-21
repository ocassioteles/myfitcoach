const db = require('../../data/database');

class ExerciseModel {
  static getAll() {
    return db.exercises;
  }

  static getById(id) {
    return db.exercises.find(ex => ex.id === parseInt(id));
  }

  static create(exerciseData) {
    const newExercise = {
      id: db.nextId.exercises++,
      name: exerciseData.name,
      muscleGroup: exerciseData.muscleGroup,
      equipment: exerciseData.equipment || 'Peso Livre',
      description: exerciseData.description || '',
      createdAt: new Date().toISOString()
    };
    
    db.exercises.push(newExercise);
    return newExercise;
  }

  static update(id, exerciseData) {
    const index = db.exercises.findIndex(ex => ex.id === parseInt(id));
    if (index === -1) return null;

    db.exercises[index] = {
      ...db.exercises[index],
      ...exerciseData,
      updatedAt: new Date().toISOString()
    };

    return db.exercises[index];
  }

  static delete(id) {
    const index = db.exercises.findIndex(ex => ex.id === parseInt(id));
    if (index === -1) return false;

    db.exercises.splice(index, 1);
    return true;
  }

  static getByMuscleGroup(muscleGroup) {
    return db.exercises.filter(ex => 
      ex.muscleGroup.toLowerCase().includes(muscleGroup.toLowerCase())
    );
  }
}

module.exports = ExerciseModel;