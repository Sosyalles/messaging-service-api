import { Router } from 'express';
import { healthCheck } from '../controllers/HealthController';

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Get service health status
 *     description: Returns the health status of the service and its dependencies
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       example: 123.45
 *                     timestamp:
 *                       type: number
 *                       example: 1234567890
 *                     database:
 *                       type: boolean
 *                       example: true
 *                     rabbitmq:
 *                       type: boolean
 *                       example: true
 *       503:
 *         description: Service is degraded
 */
router.get('/', healthCheck);

export default router; 