import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const INITIAL_EXERCISES = [
  {
    name: 'Bench Press',
    description: 'Barbell flat bench press for chest strength and hypertrophy',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    movementPattern: 'Horizontal Push',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Lie flat on the bench, grip the bar slightly wider than shoulder width, lower bar to mid-chest, and press up to lock out.',
  },
  {
    name: 'Incline Dumbbell Press',
    description: 'Upper chest dumbbell press on an inclined bench',
    muscleGroup: 'Upper Chest',
    equipment: 'Dumbbell',
    movementPattern: 'Horizontal Push',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Set bench to 30-45 degrees, press dumbbells upward over chest while controlling the eccentric phase.',
  },
  {
    name: 'Squat',
    description: 'Barbell back squat targeting quadriceps, glutes, and core',
    muscleGroup: 'Quadriceps',
    equipment: 'Barbell',
    movementPattern: 'Squat',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Bar resting on upper back, descend until thighs are parallel to ground, drive through heels to stand.',
  },
  {
    name: 'Deadlift',
    description: 'Conventional barbell deadlift for posterior chain power',
    muscleGroup: 'Back / Hamstrings',
    equipment: 'Barbell',
    movementPattern: 'Hinge',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Stand over bar, grip with hands shoulder-width, keep spine neutral, drive hips forward to stand.',
  },
  {
    name: 'Overhead Press',
    description: 'Standing overhead shoulder press with barbell',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell',
    movementPattern: 'Vertical Push',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Bar resting on front delts, press vertically overhead locking out elbows overhead.',
  },
  {
    name: 'Barbell Row',
    description: 'Bent over barbell row for lat and upper back thickness',
    muscleGroup: 'Upper Back',
    equipment: 'Barbell',
    movementPattern: 'Horizontal Pull',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Hinge at hips to 45 degrees, pull bar towards lower abdomen while squeezing shoulder blades.',
  },
  {
    name: 'Lat Pulldown',
    description: 'Cable lat pulldown for upper back and lat width',
    muscleGroup: 'Lats',
    equipment: 'Cable',
    movementPattern: 'Vertical Pull',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Sit at machine, grip bar wide, pull bar down towards upper chest maintaining chest upright.',
  },
  {
    name: 'Pull-Up',
    description: 'Bodyweight pull-up for upper body pulling strength',
    muscleGroup: 'Lats / Biceps',
    equipment: 'Bodyweight',
    movementPattern: 'Vertical Pull',
    exerciseType: 'BODYWEIGHT_REPS',
    instructions: 'Hang from pull-up bar, pull chest to bar, lower down with full control.',
  },
  {
    name: 'Leg Press',
    description: 'Machine leg press for quad and leg development',
    muscleGroup: 'Quadriceps',
    equipment: 'Machine',
    movementPattern: 'Squat',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Place feet shoulder-width on sled, release safety, lower weight under control and press back up.',
  },
  {
    name: 'Leg Curl',
    description: 'Lying or seated machine leg curl for hamstrings',
    muscleGroup: 'Hamstrings',
    equipment: 'Machine',
    movementPattern: 'Leg Extension/Flexion',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Flex knees against resistance pad to bring heels toward glutes, return slowly.',
  },
  {
    name: 'Leg Extension',
    description: 'Seated machine leg extension for isolated quad work',
    muscleGroup: 'Quadriceps',
    equipment: 'Machine',
    movementPattern: 'Leg Extension/Flexion',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Extend knees against pad until legs are straight, contract quads, lower slowly.',
  },
  {
    name: 'Bicep Curl',
    description: 'Dumbbell or barbell bicep curl for arm flexion',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbell',
    movementPattern: 'Arm Flexion',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Keep elbows tucked at sides, curl weight up towards shoulders, lower slowly.',
  },
  {
    name: 'Tricep Pushdown',
    description: 'Cable rope or bar pushdown for tricep extension',
    muscleGroup: 'Triceps',
    equipment: 'Cable',
    movementPattern: 'Arm Extension',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Pin elbows to torso, push cable handle down until arms lock out, return under control.',
  },
  {
    name: 'Lateral Raise',
    description: 'Dumbbell side lateral raise for side shoulder width',
    muscleGroup: 'Side Delts',
    equipment: 'Dumbbell',
    movementPattern: 'Shoulder Abduction',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Raise dumbbells outward to shoulder height keeping a slight bend in elbows, control descent.',
  },
  {
    name: 'Cable Fly',
    description: 'Standing cable chest fly for chest isolation and stretch',
    muscleGroup: 'Chest',
    equipment: 'Cable',
    movementPattern: 'Horizontal Adduction',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Set cables to shoulder height, bring hands together in front of chest in a hugging motion.',
  },
];

export const INITIAL_FOODS = [
  {
    name: 'Chicken Breast (Raw)',
    description: 'Boneless skinless chicken breast',
    servingSize: 100,
    servingUnit: 'g',
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fat: 3.6,
    fiber: 0,
    ownerId: null,
  },
  {
    name: 'White Rice (Cooked)',
    description: 'Long grain cooked white rice',
    servingSize: 100,
    servingUnit: 'g',
    calories: 130,
    protein: 2.7,
    carbohydrates: 28.2,
    fat: 0.3,
    fiber: 0.4,
    ownerId: null,
  },
  {
    name: 'Whole Egg (Large)',
    description: 'Large raw whole chicken egg',
    servingSize: 1,
    servingUnit: 'piece',
    calories: 72,
    protein: 6.3,
    carbohydrates: 0.4,
    fat: 4.8,
    fiber: 0,
    ownerId: null,
  },
  {
    name: 'Rolled Oats (Raw)',
    description: 'Whole grain rolled oats',
    servingSize: 100,
    servingUnit: 'g',
    calories: 389,
    protein: 16.9,
    carbohydrates: 66.3,
    fat: 6.9,
    fiber: 10.6,
    ownerId: null,
  },
  {
    name: 'Atlantic Salmon (Raw)',
    description: 'Raw wild or farmed Atlantic salmon fillet',
    servingSize: 100,
    servingUnit: 'g',
    calories: 208,
    protein: 20.4,
    carbohydrates: 0,
    fat: 13.4,
    fiber: 0,
    ownerId: null,
  },
  {
    name: 'Broccoli (Raw)',
    description: 'Fresh raw broccoli florets',
    servingSize: 100,
    servingUnit: 'g',
    calories: 34,
    protein: 2.8,
    carbohydrates: 6.6,
    fat: 0.4,
    fiber: 2.6,
    ownerId: null,
  },
  {
    name: 'Banana (Medium)',
    description: 'Fresh ripe banana',
    servingSize: 1,
    servingUnit: 'piece',
    calories: 105,
    protein: 1.3,
    carbohydrates: 27,
    fat: 0.3,
    fiber: 3.1,
    ownerId: null,
  },
  {
    name: 'Almonds (Raw)',
    description: 'Whole unroasted almonds',
    servingSize: 100,
    servingUnit: 'g',
    calories: 579,
    protein: 21.2,
    carbohydrates: 21.7,
    fat: 49.9,
    fiber: 12.5,
    ownerId: null,
  },
];

async function main() {
  console.log('[GBUD Seed] Seeding initial system exercise catalog...');

  for (const exercise of INITIAL_EXERCISES) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise,
    });
  }

  console.log(`[GBUD Seed] Successfully seeded ${INITIAL_EXERCISES.length} system exercises.`);

  console.log('[GBUD Seed] Seeding initial system food catalog...');
  for (const food of INITIAL_FOODS) {
    const existing = await prisma.food.findFirst({
      where: { name: food.name, ownerId: null },
    });
    if (!existing) {
      await prisma.food.create({ data: food });
    }
  }
  console.log(`[GBUD Seed] Successfully seeded ${INITIAL_FOODS.length} system foods.`);
}

main()
  .catch((e) => {
    console.error('[GBUD Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
