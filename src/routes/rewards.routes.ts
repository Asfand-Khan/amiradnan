import { Router } from 'express';
import { RewardController } from '../controllers/reward.controller.js';
import { validateResource } from '../middleware/validation.middleware.js';
import { createRewardSchema, listRewardsSchema, singleRewardSchema, updateRewardSchema } from '../validations/reward.validations.js';

const router = Router();
const rewardController = new RewardController();

// Reward CRUD routes
router.post('/', validateResource(createRewardSchema), rewardController.create);
router.post('/list', validateResource(listRewardsSchema), rewardController.getAll);
router.get('/active', rewardController.getActiveRewards);
router.post('/search',rewardController.searchRewards);
router.post('/single', validateResource(singleRewardSchema), rewardController.getById);
router.put('/', validateResource(updateRewardSchema), rewardController.update);
router.delete('/', validateResource(singleRewardSchema), rewardController.delete);

// Additional operations
router.post('/restore', validateResource(singleRewardSchema), rewardController.restore);
router.post('/hard-delete', validateResource(singleRewardSchema), rewardController.hardDelete);
router.post('/toggle-status', validateResource(singleRewardSchema), rewardController.toggleStatus);
router.post('/stats', validateResource(singleRewardSchema), rewardController.getStats);
router.post('/bulk/update-status', rewardController.bulkUpdateStatus);

export default router;