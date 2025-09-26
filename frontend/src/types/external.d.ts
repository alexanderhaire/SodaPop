declare module "lightweight-charts" {
  export type IChartApi = any;
  export type UTCTimestamp = number;
  export type CandlestickSeries = any;
  export function createChart(container: HTMLElement, options?: any): IChartApi;
}

declare module "zustand" {
  type StateCreator<T> = (set: any, get: any, api: any) => T;
  interface StoreApi<T> {
    getState(): T;
    setState(partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean): void;
    subscribe(listener: (state: T, prevState: T) => void): () => void;
  }
  interface ZustandStore<T> extends StoreApi<T> {
    <U>(selector: (state: T) => U): U;
  }
  export function create<T>(initializer: StateCreator<T>): ZustandStore<T>;
}
