export type ActionType = string;

export type ActionExecutorPromise = Promise<JSONStringifyableResult>;
export type ActionExecutor = (
  action: Action,
  controller: QueueController
) => ActionExecutorPromise;

export type ActionProps = {
  type: ActionType;
  executor: ActionExecutor;
};

export type JSONStringifyableResult =
  | string
  | number
  | boolean
  | null
  | JSONStringifyableResult[]
  | { [key: string]: JSONStringifyableResult };

export type ActionUpdateProps = {
  updatedAt: number;
  complete: boolean;
  active: boolean;
  result?: JSONStringifyableResult;
  errorMessage?: string;
};

export type Action = ActionProps & ActionUpdateProps;
export type InitialQueue = ActionProps[];
export type ActionQueue = Action[];
export type QueueController = {
  getQueue: () => ActionQueue;
  clean: () => void;
  reset: () => void;
  updateActionAndQueue: (
    type: ActionType,
    props: Partial<Exclude<ActionUpdateProps, 'updatedAt'>>
  ) => ActionQueue;
  getNext: () => Action | undefined;
  getActive: () => Action | undefined;
  getFailed: () => Action | undefined;
  getResult: (actionOrActionType: Action | ActionType) => unknown;
  getByType: (type: ActionType) => Action | undefined;
  getComplete: () => Action[];
  isFinished: () => boolean;
  activateAction: (actionOrActionType: Action | ActionType) => ActionQueue;
  completeAction: (
    actionOrActionType: Action | ActionType,
    result: Action['result']
  ) => ActionQueue;
  setActionFailed: (
    actionOrActionType: Action | ActionType,
    errorMessage: Action['errorMessage']
  ) => ActionQueue;
};

type ActionFilter = (action: Action) => boolean;

// Merges two sets of action props in to a new action
function restore(
  currentProps: Partial<Action | ActionProps | ActionUpdateProps>,
  props: Partial<ActionProps | ActionUpdateProps>
): Action {
  return {
    ...currentProps,
    ...props,
  } as Action;
}

// Clears action props making it invalid and unexecutable
function invalidate(action: Action): Action {
  action.updatedAt = -1;
  action.executor = () => {
    throw new Error('This queue item has been invalidated');
  };
  action.type = '';
  action.complete = false;
  action.active = false;
  action.errorMessage = 'invalidated';
  action.result = undefined;
  return action;
}

// Resets updateable action props and returns a new action
function reset(action: Action | ActionProps): Action {
  const resetProps: ActionUpdateProps = {
    updatedAt: Date.now(),
    complete: false,
    active: false,
    result: undefined,
    errorMessage: undefined,
  };
  return restore(action, resetProps);
}

function createAction(props: ActionProps): Action {
  return reset(props);
}

// Returns true if given object has only action props
// If true, and action should be created from props,
// because it is not a "complete" action object.
function hasOnlyActionProps(action: ActionProps | Action) {
  return typeof Reflect.get(action, 'complete') === 'undefined';
}

// Checks all actions have type defined and they are unique
function checkTypesAreUniqueAndSet(list: Array<ActionProps | Action>) {
  const uniqueTypes = new Set<ActionType>();
  list.forEach(action => {
    const { type } = action;
    if (!type) {
      throw new Error(`Action must have a type.`);
    }
    if (uniqueTypes.has(type)) {
      throw new Error(`Action types must be unique. Found ${type}.`);
    }
    uniqueTypes.add(type);
  });
}

export function createQueueFromProps(
  props: Array<Action | ActionProps>
): ActionQueue {
  checkTypesAreUniqueAndSet(props);
  return props.map(actionOrProps => {
    if (hasOnlyActionProps(actionOrProps)) {
      return createAction(actionOrProps);
    }
    return actionOrProps as Action;
  });
}

const activeFilter: ActionFilter = action => action.active;

const idleFilter: ActionFilter = action => {
  if (action.complete) {
    return false;
  }
  return !action.active;
};

const completeFilter: ActionFilter = action => action.complete;

const errorFilter: ActionFilter = action =>
  action.complete && !!action.errorMessage;

// QueueController handles the queue updates and prevents mutating the queue directly
export function createQueueController(
  initialQueue: ActionQueue
): QueueController {
  let queue: ActionQueue = initialQueue;

  const filterQueue = (f: ActionFilter): Action[] => queue.filter(f);

  const getByType = (type: ActionType) => queue.filter(f => f.type === type)[0];
  checkTypesAreUniqueAndSet(initialQueue);

  const getNext = () => queue.find(idleFilter);

  const isFinished = () =>
    !!filterQueue(errorFilter).length ||
    filterQueue(completeFilter).length === queue.length;

  const checkIfActionCanUpdate = (
    action: Action,
    newProps: Partial<ActionUpdateProps>
  ) => {
    if (completeFilter(action) || errorFilter(action) || !action.type) {
      return false;
    }
    return !(newProps.active && action.active);
  };

  const getCurrentActionVersion = (actionOrActionType: Action | ActionType) =>
    getByType(
      typeof actionOrActionType === 'string'
        ? actionOrActionType
        : actionOrActionType.type
    );

  const updateActionAndQueue: QueueController['updateActionAndQueue'] = (
    type,
    props
  ) => {
    const item = getByType(type);
    if (!item) {
      throw new Error(`Unable to update item. Item of type ${type} not found.`);
    }
    const newQueue = queue.map(action => {
      if (action.type === type) {
        return restore(item, { ...props, updatedAt: Date.now() });
      }
      return { ...action };
    });
    queue.map(invalidate);
    queue = newQueue;
    return queue;
  };

  const updateIfPossible = (
    actionOrActionType: Action | ActionType,
    newProps: Partial<ActionUpdateProps>
  ) => {
    const action = getCurrentActionVersion(actionOrActionType);
    if (checkIfActionCanUpdate(action, newProps)) {
      return updateActionAndQueue(action.type, newProps);
    } else {
      throw new Error(
        `Action cannot be updated to ${JSON.stringify(newProps)}`
      );
    }
  };

  return {
    getQueue: () => queue.map(action => ({ ...action })),
    clean: () => {
      queue.forEach(item => invalidate(item));
      queue = [];
    },
    updateActionAndQueue,
    reset: () => {
      const newQueue = queue.map(item => reset(item));
      queue.map(invalidate);
      queue = newQueue;
    },
    getActive: () => filterQueue(activeFilter)[0],
    getComplete: () => filterQueue(completeFilter),
    getFailed: () => filterQueue(errorFilter)[0],
    getResult: actionOrActionType => {
      const action = getCurrentActionVersion(actionOrActionType);
      return action && action.complete ? action.result : undefined;
    },
    getNext,
    getByType,
    isFinished,
    activateAction: actionOrActionType =>
      updateIfPossible(actionOrActionType, { active: true }),
    setActionFailed: (actionOrActionType, errorMessage) =>
      updateIfPossible(actionOrActionType, {
        errorMessage,
        complete: true,
        active: false,
      }),
    completeAction: (actionOrActionType, result) =>
      updateIfPossible(actionOrActionType, {
        result,
        complete: true,
        active: false,
      }),
  };
}
