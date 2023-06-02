// Taken from @gbegher/groth

export type Product<T = any> = Record<string, T>
export type Mor<S, T> = (s: S) => T

type Reducer<S, A> = {
  init: () => A
  step: Mor<S, Mor<A, A>>
}

type AugmentedProduct<S> = {
  map: <T>(fn: Mor<S, T>) => Product<T>
  reduce: <A>(reducer: Reducer<[key: string, value: S], A>) => A
}

export const product = <T>(prod: Product<T>): AugmentedProduct<T> => {
  const map: AugmentedProduct<T>["map"] = (fn) =>
    Object.fromEntries(Object.entries(prod).map(([k, v]) => [k, fn(v)]))

  const reduce: AugmentedProduct<T>["reduce"] = (red) =>
    Object.entries(prod).reduce(
      (acc, entry) => red.step(entry)(acc),
      red.init()
    )

  return {
    map,
    reduce,
  }
}
