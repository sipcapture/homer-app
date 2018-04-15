import template from './templates/main-content.template.html';
import controller from './controllers/main-content.controller';

const mainContent = {
  controller,
  template,
  bindings: {
    appPreferences: '=',
  },
};

export default mainContent;
