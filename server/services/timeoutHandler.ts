import { HelpRequestModel } from '../database/models';
import { RequestStatus } from '../../shared/types';

/**
 * Background service to check for timed-out requests and mark them as unresolved
 */
export class TimeoutHandler {
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor(private helpRequestModel: HelpRequestModel) {}
  
  start(intervalMs = 60000): void {
    // Check every minute for timed-out requests
    this.intervalId = setInterval(() => {
      this.checkTimeouts();
    }, intervalMs);
    
    console.log('⏰ Timeout handler started');
  }
  
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏰ Timeout handler stopped');
    }
  }
  
  private checkTimeouts(): void {
    try {
      const pending = this.helpRequestModel.getPending();
      const now = new Date();
      
      for (const request of pending) {
        if (request.timeoutAt) {
          const timeoutDate = new Date(request.timeoutAt);
          if (now > timeoutDate) {
            console.log(`⏱️ Request ${request.id} timed out`);
            this.helpRequestModel.markUnresolved(request.id);
          }
        }
      }
    } catch (error) {
      console.error('Error checking timeouts:', error);
    }
  }
}

