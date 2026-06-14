/**
 * ResponseTimer - High-precision response time measurement
 * Captures keyboard, mouse, and touch input with millisecond accuracy
 */

import type { 
  ResponseEvent, 
  ResponseCallback, 
  TimingError,
  ErrorCallback 
} from './types';

interface ResponseConfig {
  enableKeyboard: boolean;
  enableMouse: boolean;
  enableTouch: boolean;
  validKeys?: string[];
  validButtons?: number[];
  responseWindow?: { min: number; max: number };
  multipleResponses: boolean;
}

interface ActiveStimulus {
  id: string;
  startTime: number;
  responses: ResponseEvent[];
  responseWindow?: { min: number; max: number };
}

export class ResponseTimer {
  private activeStimuli: Map<string, ActiveStimulus> = new Map();
  private responseCallbacks: Set<ResponseCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private config: ResponseConfig;
  private element: HTMLElement;
  
  // Event listeners (stored for cleanup)
  private keydownListener?: (event: KeyboardEvent) => void;
  private mousedownListener?: (event: MouseEvent) => void;
  private touchstartListener?: (event: TouchEvent) => void;

  constructor(element: HTMLElement, config: Partial<ResponseConfig> = {}) {
    this.element = element;
    this.config = {
      enableKeyboard: true,
      enableMouse: true,
      enableTouch: true,
      multipleResponses: false,
      ...config
    };
    
    this.setupEventListeners();
  }

  /**
   * Start collecting responses for a stimulus
   */
  public startCollection(
    stimulusId: string, 
    startTime?: number,
    responseWindow?: { min: number; max: number }
  ): void {
    const activeStimulus: ActiveStimulus = {
      id: stimulusId,
      startTime: startTime || performance.now(),
      responses: [],
      responseWindow: responseWindow || this.config.responseWindow
    };
    
    this.activeStimuli.set(stimulusId, activeStimulus);
  }

  /**
   * Stop collecting responses for a stimulus
   */
  public stopCollection(stimulusId: string): ResponseEvent[] {
    const stimulus = this.activeStimuli.get(stimulusId);
    if (!stimulus) return [];
    
    const responses = [...stimulus.responses];
    this.activeStimuli.delete(stimulusId);
    
    return responses;
  }

  /**
   * Stop all active response collections
   */
  public stopAllCollections(): Map<string, ResponseEvent[]> {
    const allResponses = new Map<string, ResponseEvent[]>();
    
    this.activeStimuli.forEach((stimulus, id) => {
      allResponses.set(id, [...stimulus.responses]);
    });
    
    this.activeStimuli.clear();
    
    return allResponses;
  }

  /**
   * Get responses for a specific stimulus
   */
  public getResponses(stimulusId: string): ResponseEvent[] {
    const stimulus = this.activeStimuli.get(stimulusId);
    return stimulus ? [...stimulus.responses] : [];
  }

  /**
   * Check if collecting responses for a stimulus
   */
  public isCollecting(stimulusId: string): boolean {
    return this.activeStimuli.has(stimulusId);
  }

  /**
   * Add callback for response events
   */
  public onResponse(callback: ResponseCallback): () => void {
    this.responseCallbacks.add(callback);
    return () => this.responseCallbacks.delete(callback);
  }

  /**
   * Add callback for error events
   */
  public onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ResponseConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setupEventListeners(); // Reattach listeners with new config
  }

  /**
   * Get response time statistics for all collected responses
   */
  public getResponseStats() {
    const allResponses: ResponseEvent[] = [];
    
    this.activeStimuli.forEach(stimulus => {
      allResponses.push(...stimulus.responses);
    });
    
    if (allResponses.length === 0) {
      return { mean: 0, std: 0, count: 0, min: 0, max: 0 };
    }
    
    const reactionTimes = allResponses.map(r => r.reactionTime);
    const mean = reactionTimes.reduce((sum, rt) => sum + rt, 0) / reactionTimes.length;
    const variance = reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / reactionTimes.length;
    const std = Math.sqrt(variance);
    const min = Math.min(...reactionTimes);
    const max = Math.max(...reactionTimes);
    
    return {
      mean,
      std,
      count: reactionTimes.length,
      min,
      max
    };
  }

  /**
   * Cleanup event listeners
   */
  public destroy(): void {
    this.removeEventListeners();
    this.activeStimuli.clear();
    this.responseCallbacks.clear();
    this.errorCallbacks.clear();
  }

  /**
   * Private: Setup event listeners based on configuration
   */
  private setupEventListeners(): void {
    // Remove existing listeners first
    this.removeEventListeners();
    
    if (this.config.enableKeyboard) {
      this.keydownListener = this.handleKeydown.bind(this);
      this.element.addEventListener('keydown', this.keydownListener, { passive: false });
      
      // Ensure element can receive keyboard events
      if (this.element.tabIndex === -1) {
        this.element.tabIndex = 0;
      }
    }
    
    if (this.config.enableMouse) {
      this.mousedownListener = this.handleMousedown.bind(this);
      this.element.addEventListener('mousedown', this.mousedownListener, { passive: false });
    }
    
    if (this.config.enableTouch) {
      this.touchstartListener = this.handleTouchstart.bind(this);
      this.element.addEventListener('touchstart', this.touchstartListener, { passive: false });
    }
  }

  /**
   * Private: Remove event listeners
   */
  private removeEventListeners(): void {
    if (this.keydownListener) {
      this.element.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = undefined;
    }
    
    if (this.mousedownListener) {
      this.element.removeEventListener('mousedown', this.mousedownListener);
      this.mousedownListener = undefined;
    }
    
    if (this.touchstartListener) {
      this.element.removeEventListener('touchstart', this.touchstartListener);
      this.touchstartListener = undefined;
    }
  }

  /**
   * Private: Handle keyboard input
   */
  private handleKeydown(event: KeyboardEvent): void {
    const timestamp = performance.now();
    
    // Check if key is valid
    if (this.config.validKeys && !this.config.validKeys.includes(event.key)) {
      return;
    }
    
    // Prevent default behavior for timing-critical responses
    event.preventDefault();
    
    this.processResponse({
      type: 'keyboard',
      timestamp,
      key: event.key,
      event
    });
  }

  /**
   * Private: Handle mouse input
   */
  private handleMousedown(event: MouseEvent): void {
    const timestamp = performance.now();
    
    // Check if button is valid
    if (this.config.validButtons && !this.config.validButtons.includes(event.button)) {
      return;
    }
    
    // Prevent default behavior for timing-critical responses
    event.preventDefault();
    
    this.processResponse({
      type: 'mouse',
      timestamp,
      button: event.button,
      coordinates: { x: event.clientX, y: event.clientY },
      event
    });
  }

  /**
   * Private: Handle touch input
   */
  private handleTouchstart(event: TouchEvent): void {
    const timestamp = performance.now();
    
    // Prevent default behavior for timing-critical responses
    event.preventDefault();
    
    const touch = event.touches[0];
    if (touch) {
      this.processResponse({
        type: 'touch',
        timestamp,
        coordinates: { x: touch.clientX, y: touch.clientY },
        event
      });
    }
  }

  /**
   * Private: Process response and create ResponseEvent
   */
  private processResponse(responseData: {
    type: 'keyboard' | 'mouse' | 'touch';
    timestamp: number;
    key?: string;
    button?: number;
    coordinates?: { x: number; y: number };
    event: Event;
  }): void {
    // Find active stimuli that should receive this response
    this.activeStimuli.forEach((stimulus, stimulusId) => {
      // Check if already has response and multiple responses not allowed
      if (!this.config.multipleResponses && stimulus.responses.length > 0) {
        return;
      }
      
      const reactionTime = responseData.timestamp - stimulus.startTime;
      
      // Check response window
      if (stimulus.responseWindow) {
        if (reactionTime < stimulus.responseWindow.min || reactionTime > stimulus.responseWindow.max) {
          return; // Response outside valid window
        }
      }
      
      // Create response event
      const responseEvent: ResponseEvent = {
        id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        stimulusId,
        type: responseData.type,
        timestamp: responseData.timestamp,
        reactionTime,
        key: responseData.key,
        button: responseData.button,
        coordinates: responseData.coordinates
      };
      
      // Add to stimulus responses
      stimulus.responses.push(responseEvent);
      
      // Notify callbacks
      this.responseCallbacks.forEach(callback => {
        try {
          callback(responseEvent);
        } catch (error) {
          console.error('Response callback error:', error);
        }
      });
    });
  }

  /**
   * Private: Emit timing error
   */
  private emitError(code: TimingError['code'], message: string, details?: any): void {
    const error = new Error(message) as TimingError;
    error.code = code;
    error.details = details;
    
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error callback failed:', callbackError);
      }
    });
  }
}