

let state: any = {}

export const setState = (newState: any) => {
  state = newState
}

export const getState = () => state
