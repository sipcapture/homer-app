class HomerHelper {
  constructor() {}

  isCurrentUiRouterState(uiRouterState, currentStateName, boardID = null) {
    if (!boardID) {
      return uiRouterState.current.name === currentStateName;
    }
    return uiRouterState.current.name === currentStateName && uiRouterState.params.boardID === boardID;
  }
}

export default HomerHelper;
