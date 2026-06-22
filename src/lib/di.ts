/**
 * Simple Production Dependency Injection Container
 * Lightweight, no external deps.
 * Services register themselves or are registered at startup.
 */

type Factory<T> = () => T;
type ServiceMap = Map<string, any>;

class Container {
  private services: ServiceMap = new Map();
  private factories: Map<string, Factory<any>> = new Map();

  register<T>(name: string, factory: Factory<T>): void {
    this.factories.set(name, factory);
  }

  registerInstance<T>(name: string, instance: T): void {
    this.services.set(name, instance);
  }

  get<T>(name: string): T {
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }

    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Service not registered: ${name}`);
    }

    const instance = factory();
    this.services.set(name, instance); // singleton by default
    return instance as T;
  }

  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }

  // For testing
  clear() {
    this.services.clear();
    this.factories.clear();
  }
}

export const container = new Container();

// Convenience for common services (register in index or startup)
export function registerServices() {
  // Example registrations will be added as we migrate services
  // container.register('userService', () => userService);
  // etc.
}

export { Container };
