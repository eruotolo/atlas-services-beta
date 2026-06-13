import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
// unused getMessaging

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly config: ConfigService) {
    if (getApps().length === 0) {
      // Intentamos inicializar Firebase Admin
      const serviceAccountJson = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT');
      
      if (serviceAccountJson) {
        try {
          const serviceAccount = JSON.parse(serviceAccountJson);
          initializeApp({
            credential: cert(serviceAccount)
          });
          this.logger.log('Firebase Admin inicializado correctamente.');
        } catch (e) {
          this.logger.error('Error parseando FIREBASE_SERVICE_ACCOUNT JSON.', e);
        }
      } else {
        this.logger.warn('FIREBASE_SERVICE_ACCOUNT no configurado. Las notificaciones Push serán simuladas (MOCK).');
      }
    }
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    this.logger.log(`Enviando Push Notification a usuario ${userId}: ${title}`);

    // MOCK: En un entorno real, buscaríamos el fcmToken del usuario en la base de datos
    // const user = await this.prisma.user.findUnique({ where: { id: userId } });
    // const token = user?.fcmToken;
    const token = 'mock_fcm_token_para_' + userId;

    if (getApps().length === 0) {
      this.logger.log(`[SIMULACIÓN FCM] Token: ${token} | Titulo: ${title} | Body: ${body}`);
      return { success: true, simulated: true };
    }

    try {
      if (data) {
        this.logger.log(`Data extra: ${JSON.stringify(data)}`);
      }

      // Si tuvieramos token real: 
      // const response = await admin.messaging().send(message);
      this.logger.log(`[FCM Real desactivado temporalmente para stub token]`);
      return { success: true, messageId: `mock_${Date.now()}` };
    } catch (error) {
      const errMsg = (error as Error).message;
      this.logger.error(`Error enviando notificación: ${errMsg}`);
      return { success: false, error: errMsg };
    }
  }
}
