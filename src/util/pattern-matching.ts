// Taken from @gbegher/groth

import { Mor, Product } from "./object-tools"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ValueOf<T> = T[keyof T]

export type Sum<Cases extends Product> = ValueOf<Sum.SumMapping<Cases>>

export namespace Sum {
  export type SumMapping<Cases extends Product> = {
    [cs in keyof Cases]: {
      type: cs
      value: Cases[cs]
    }
  }

  export type Value<K extends string, X> = { type: K; value: X }

  export type Component<S extends Sum<any>, K extends CaseName<S>> = SumMapping<
    SumDefinition<S>
  >[K]

  export type CaseName<S extends Sum<any>> = S["type"]

  export type Case<S extends Sum<any>, K extends CaseName<S>> = S extends {
    type: K
    value: infer T
  }
    ? T
    : never

  export type SumDefinition<S extends Sum<any>> = {
    [k in CaseName<S>]: Case<S, k>
  }

  export type Matching<S extends Sum<any>> = {
    [k in CaseName<S>]: Mor<Case<S, k>, any>
  }

  export type ImplicitInMatching<M extends Record<string, Mor<any, any>>> =
    Sum<{
      [k in keyof M & string]: Parameters<M[k]> extends [infer T, ...any[]]
        ? T
        : any
    }>
}

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export const match = <S extends Sum<any>, M extends Sum.Matching<S>>(
  input: S,
  matching: M
): ReturnType<M[S["type"]]> =>
  matching[input.type as Sum.CaseName<S>](input.value)

export const matchWith =
  <M extends Record<string, Mor<any, any>>>(matching: M) =>
  <S extends Sum.ImplicitInMatching<M>>(input: S): ReturnType<M[S["type"]]> =>
    match<Sum.ImplicitInMatching<M>, M>(input, matching)

export const component = <K extends string, X>(
  type: K,
  value: X
): Sum.Value<K, X> => ({ type, value })

export const componentConstructor =
  <S extends Sum<any>, T extends Sum.CaseName<S>>(type: T) =>
  (value: Sum.Case<S, T>): Sum.Component<S, T> => ({ type, value })
