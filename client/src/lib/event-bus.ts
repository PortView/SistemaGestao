
/**
 * EventBus - Sistema de mensageria assíncrona para comunicação entre componentes
 * 
 * Permite que componentes se comuniquem sem referência direta entre si,
 * evitando dependências cíclicas e loops infinitos.
 */

type EventCallback = (data?: any) => void;

interface EventSubscription {
  eventName: string;
  callback: EventCallback;
  once: boolean;
}

class EventBus {
  private static instance: EventBus;
  private subscribers: EventSubscription[] = [];
  private debug: boolean = false;

  private constructor() {}

  /**
   * Obtém a instância única do EventBus (Singleton)
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Ativa ou desativa mensagens de debug
   */
  public setDebug(value: boolean): void {
    this.debug = value;
  }

  /**
   * Inscreve um callback para ser executado quando um evento for emitido
   * @param eventName Nome do evento
   * @param callback Função a ser executada
   * @returns Função para cancelar a inscrição
   */
  public on(eventName: string, callback: EventCallback): () => void {
    if (this.debug) {
      console.log(`EventBus: Nova inscrição para o evento "${eventName}"`);
    }
    
    const subscription: EventSubscription = {
      eventName,
      callback,
      once: false
    };
    
    this.subscribers.push(subscription);
    
    // Retorna função para cancelar a inscrição
    return () => this.off(eventName, callback);
  }

  /**
   * Inscreve um callback para ser executado apenas uma vez
   * @param eventName Nome do evento
   * @param callback Função a ser executada
   * @returns Função para cancelar a inscrição
   */
  public once(eventName: string, callback: EventCallback): () => void {
    if (this.debug) {
      console.log(`EventBus: Nova inscrição única para o evento "${eventName}"`);
    }
    
    const subscription: EventSubscription = {
      eventName,
      callback,
      once: true
    };
    
    this.subscribers.push(subscription);
    
    // Retorna função para cancelar a inscrição
    return () => this.off(eventName, callback);
  }

  /**
   * Cancela a inscrição de um callback para um evento
   * @param eventName Nome do evento
   * @param callback Função a ser removida
   */
  public off(eventName: string, callback: EventCallback): void {
    this.subscribers = this.subscribers.filter(
      subscription => 
        !(subscription.eventName === eventName && 
          subscription.callback === callback)
    );
    
    if (this.debug) {
      console.log(`EventBus: Inscrição cancelada para o evento "${eventName}"`);
    }
  }

  /**
   * Emite um evento com dados opcionais
   * @param eventName Nome do evento
   * @param data Dados a serem passados para os callbacks
   */
  public emit(eventName: string, data?: any): void {
    if (this.debug) {
      console.log(`EventBus: Emitindo evento "${eventName}"`, data);
    }
    
    // Cria uma cópia da lista para evitar problemas se o array mudar durante a iteração
    const subscribers = [...this.subscribers];
    
    // Lista para armazenar inscrições de uso único que serão removidas
    const toRemove: EventSubscription[] = [];
    
    // Notifica todos os inscritos
    for (const subscription of subscribers) {
      if (subscription.eventName === eventName) {
        // Executa o callback com os dados
        subscription.callback(data);
        
        // Se for uma inscrição de uso único, marca para remoção
        if (subscription.once) {
          toRemove.push(subscription);
        }
      }
    }
    
    // Remove inscrições de uso único que foram executadas
    if (toRemove.length > 0) {
      this.subscribers = this.subscribers.filter(
        sub => !toRemove.includes(sub)
      );
    }
  }

  /**
   * Remove todas as inscrições
   */
  public clear(): void {
    this.subscribers = [];
    if (this.debug) {
      console.log('EventBus: Todas as inscrições foram removidas');
    }
  }

  /**
   * Remove todas as inscrições para um evento específico
   * @param eventName Nome do evento
   */
  public clearEvent(eventName: string): void {
    this.subscribers = this.subscribers.filter(
      subscription => subscription.eventName !== eventName
    );
    
    if (this.debug) {
      console.log(`EventBus: Todas as inscrições para "${eventName}" foram removidas`);
    }
  }

  /**
   * Retorna o número de inscrições para um evento específico
   * @param eventName Nome do evento
   */
  public countSubscribers(eventName?: string): number {
    if (eventName) {
      return this.subscribers.filter(
        subscription => subscription.eventName === eventName
      ).length;
    }
    return this.subscribers.length;
  }
}

// Exporta a instância única do EventBus
export const eventBus = EventBus.getInstance();

// Define tipos de eventos conhecidos para facilitar o uso do TypeScript
export const EventTypes = {
  // Eventos relacionados a serviços
  SERVICE_SELECTED: 'service:selected',
  SERVICES_LOADED: 'services:loaded',
  
  // Eventos relacionados a tarefas
  TASKS_LOADED: 'tasks:loaded',
  
  // Eventos relacionados a filtros
  FILTERS_UPDATED: 'filters:updated',
  
  // Eventos relacionados à interface
  UI_REFRESH_NEEDED: 'ui:refresh-needed',
  
  // Outros eventos do sistema
  APP_INITIALIZED: 'app:initialized',
  ERROR_OCCURRED: 'error:occurred'
};

// Exporta um tipo para os eventos conhecidos
export type EventType = typeof EventTypes[keyof typeof EventTypes];
