/*
 * Provider to inject widget default config/state into dashboard
 */
const DashboardWidgetState = function() {
  const widgets = {};

  return {
    /*
     * List of all registered widgets and their configurations/states
     *
     * @return {object} widgets
     */
    $get: function() {
      return {
        widgets
      };
    },

    /*
     * Set widget state
     *
     * @param {string} category of widget
     * @param {string} name of widget
     * @param {object} data - widget config/state
     */
    set: function(category, name, data) {
      if (!widgets[category]) {
        widgets[category] = {};
      }
      widgets[category][name] = data;
    }
  };
};

export default DashboardWidgetState;
