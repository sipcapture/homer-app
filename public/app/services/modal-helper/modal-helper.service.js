class ModalHelper {
  constructor() {}

  isError(error) {
    if (['canceled', 'backdrop click', 'escape key press'].includes(error)) {
      return false;
    }
    return true;
  }
}

export default ModalHelper;
