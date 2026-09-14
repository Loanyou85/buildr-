import { PrismaClient } from '@prisma/client';
import { runSeed } from './seed/run';

const db = new PrismaClient();

runSeed(db)
  .then(async (summary) => {
    console.info(
      `Référentiel : ${summary.skills} compétences, ${summary.interests} intérêts, ${summary.milestones} jalons, ${summary.featureFlags} feature flags.`,
    );
    console.info(`Business models : ${summary.businessModels} entrées, chacune avec ses poids et ses tags.`);
    for (const journey of summary.journeys) {
      console.info(
        journey.skipped
          ? `Parcours « ${journey.name} » : déjà utilisé par un utilisateur, laissé intact.`
          : `Parcours « ${journey.name} » : ${journey.phases} phases, ${journey.steps} étapes, ${journey.actions} actions.`,
      );
    }
    if (summary.businessModelsWithoutJourney.length > 0) {
      console.info(
        `Business models sans parcours (recommandables, parcours à écrire en admin) : ${summary.businessModelsWithoutJourney.join(', ')}.`,
      );
    }
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
