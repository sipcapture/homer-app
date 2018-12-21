AngularJS 1.6.x widget
======================

Table of Contents
=================
<!--ts-->
* [Structure](#structure)
* [Module](#module)
* [Component](#component)
* [Controller](#controller)
* [Template](#template)
* [Style](#styles)
* [Integration](#integration)
<!--te-->

Structure
=========

A widget must be created as an AngularJS module and can have this file structure:
```
a-widget/
├── index.js
├── settings
│   ├── a-widget-settings.component.js
│   ├── a-widget-settings.css
│   ├── a-widget-settings.html
│   └── a-widget-settings.js
└── widget
    ├── a-widget.component.js
    ├── a-widget.css
    ├── a-widget.html
    └── a-widget.js

2 directories, 9 files
```

Widget module and its 2 components (settings and widget) defined in `index.js`. Settings component is widget settings UI code. And the widget component is the main UI where you can put a chart, table, form etc.
Each component dir contains files:
- `name.componnet.js` to define component from template and controller
- `name.js` for the controller
- `name.html` for the template
- `name.css` for styles

[Component logic](https://docs.angularjs.org/guide/component) is the same for settings and widget.

Module
======

Create a widget module and register at least 2 components: settings and widget.
Use `DashboardWidgetStateProvider` to set widget defaults which become part of a dashboard config when you add the widget and save the dashboard. Check [the documentation](https://github.com/ManifestWebDesign/angular-gridster#via-scope) to find more about the allowed configuration properties.
```
$ vi a-widget/index.js

import angular from 'angular';
import widget from './widget/a-widget.component';
import settings from './settings/a-widget-settings.component';

export default angular.module('hepicApp.aWidget', [])
  .config(['DashboardWidgetStateProvider', function(DashboardWidgetStateProvider) {
    DashboardWidgetStateProvider.set('visualize', 'a-widget', {
      title: 'A widget',
      group: 'Tools',
      name: 'awidget',
      description: 'A widget',
      sizeX: 1,
      sizeY: 1,
      refresh: false,
      config: {
        title: 'A widget',
      },
    });
  }])
  .component('aWidgetSettings', settings)
  .component('aWidget', widget);
```

Component
=========

Define `aWidget` component, register its controller and template. Put the required bindings. Other stuff can be bound too.
```
$ vi a-widget/widget/a-widget.component.js

import template from './templates/a-widget.template.html';
import controller from './controllers/a-widget.controller';

const aWidget = {
  bindings: {
    widget: '<', // one-way binding for widget config, part of the dashboard config
    onDelete: '&', // callback for widget delete dashboard func 
    onUpdate: '&', // callback for widget update dashboard func
  },
  controller,
  template,
};

export default aWidget;
```
One-way binding means that you can't add new value directly to the `widget` config inside the widget. Note, however, that both parent and component scope reference the same object, so if you are changing object properties or array elements in the component, the parent will still reflect that change. The general rule should, therefore, be to [never change an object or array property in the component scope](https://docs.angularjs.org/guide/component). You should update the config by only using `onUpdate` callback.

Controller
==========

Widget
------

Define UI logic in the controller. See comments in the code bellow for the explanation.
All methods starting with `$` in their names are optional and can be omitted. These methods are AngularJS component life-cycle hooks.
```
$ vi a-widget/widget/a-widget.js

import './a-widget.css';
import { cloneDeep } from 'lodash';

export default class AWidget {
  constructor($log, $uibModal, ModalHelper, fictionalEsService) {
    'ngInject'; // inject all modules above
    this.$log = $log; // log service
    this.$uibModal = $uibModal; // boostrap modal component
    this.ModalHelper = ModalHelper; // homer modal helper service
    this.fictionalEsService = fictionalEsService; // ATTENTION! This service doesn't exist. App will break if you inject it. It is for example only
  }

  $onInit() {
    /*
      Called on each controller after all the controllers on an element have been constructed and had their bindings initialized (and before the pre & post linking functions for the directives on this element). Put initialization code for your controller.
    */

    this._widget = cloneDeep(this.widget); // create local widget config object to avoid implicit update

    // Call async func when wizard is initializing if you need
    this.searchStuff();
  }

  $onChanges(changesObj) {
    /*
      Called whenever one-way bindings are updated by the dashboard.
      Find the binded widget config in `changesObj.widget`.
    */
  }

  $doCheck() {
    /*
      Called on each turn of the digest cycle. Provides an opportunity to detect and act on changes. 
    */
  }

  $onDestroy() {
    /*
      Called on a controller when its containing scope is destroyed. Use this hook for releasing external resources, watches and event handlers.
    */
  }

  $postLink() {
    /*
      Called after this controller's element and its children have been linked.
      Similar to the post-link function this hook can be used to set up DOM event handlers and do direct DOM manipulation.
    */
  }

  searchStuff() {
    this.fictionalEsService.search({
      index: '',
      body: { query: { match_all: {} } }
    }).then(results => {
      this.results = results;
    }).catch(err => {
      this.log.error(['AWidget'], 'fail to search es', err);
    })
  }

  delete() {
    this.onDelete({ uuid: this._widget.uuid }); // delete widget using dashboard callback func
  }

  update(widget) {
    this._widget = widget;
    this.onUpdate({ uuid: this._widget.uuid, widget }); // update widget using dashboard callback func
  }

  openSettings() { // method to open widget settings
    this.$uibModal.open({
      component: 'aWidgetSettings',
      resolve: {
        widget: () => {
          return cloneDeep(this._widget); // clone to avoid implicit update
        },
      },
    }).result.then((widget) => {
      this.update(widget); // widget config update returned from settings component
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error(['AWidget', 'settings'], error);
      }
    });
  }
}
```

Settings
--------

```
$ vi a-widget/settings/a-widget-settings.js

import './a-widget.settings.css';

export default class AWidgetSettings {
  $onInit() {
    this._widget = this.resolve.widget; // get binded widget config object
  }

  dismiss() { // cancel setting update
    this.modalInstance.dismiss();
  }

  submit() { // submit settings update
    this.modalInstance.close(this.widget);
  }
}
```

Template
========

Use `$ctrl` to access the controller scope vars and methods.

Widget
------

```
$ vi a-widget/widget/a-widget.html

<div class="box a-widget">
  <div class="box-header">
    <h3>{{ $ctrl.widget.title }}</h3>

    <div class="box-header-btns pull-right">
      <a title="settings" ng-click="$ctrl.openSettings(widget)"><i class="glyphicon glyphicon-cog"></i></a>
      <a title="Remove widget" ng-click="$ctrl.delete()"><i class="glyphicon glyphicon-trash"></i></a>
    </div>
  </div> <!-- END box-header -->

  <div class="box-content">
    <form>
      <button type="button" ng-click="$ctrl.searchStuff()">Click to search stuff!</button>
    </form>

    <p>{{ $ctrl.results | json }}</p>
  </div> <!-- END box-content -->
</div> <!-- END box -->
```

Settings
--------

```
$ vi a-widget/settings/a-widget-settings.html

<div class="a-widget-settings">
  <form name="_form" class="form-horizontal" ng-submit="$ctrl.submit(_form)">
    <div class="modal-header">
      <button type="button" class="close" ng-click="$ctrl.dismiss()" aria-hidden="true">&times;</button>
      <h3>Settings</h3>
    </div> <!-- END modal-header -->
    
    <div class="modal-body">
      <input name="name" type="text" ng-model="$ctrl._widget.name" class="form-control" />
    </div> <!-- END modal-body-->
    
    <div class="modal-footer">
      <button ng-click="$ctrl.dismiss()" class="btn btn-lg"><i class="glyphicon glyphicon-remove"></i>Cancel</button>
      <button type="submit" class="btn btn-primary btn-lg"><i class="glyphicon glyphicon-ok"></i>Save</button>
    </div> <!-- END modal-footer -->
  </form>
</div>

```

Styles
======

The widget style is put as normal CSS. The file must be imported into the controller.
```
$ vi a-widget/settings/a-widget-settings.css

.a-widget-settings .modal-body {
  height: 180px;
}
```

Integration
===========

A widget module must be placed in `public/app/widgets` directory. And it must be injected as a dependency for the parent module `hepicApp.widgets` for example
```
$ vi public/app/widgets/index.js

import AWidget from './a-widget';

export default angular.module('hepicApp.widgets', [
  AWidget.name,
]);
```  

The widget component must be defined in the `mainDashboard` component template, for example
```
$ vi public/app/dashboards/main-dashboard/templates/main-dashboard.template.html

<li gridster-item="widget" ng-repeat="widget in $ctrl.dashboard.widgets track by widget.uuid">
    <a-widget ng-if="widget.name==='awidget'" widget=widget
      on-delete="$ctrl.deleteWidget(uuid)" on-update="$ctrl.updateWidget(uuid, widget)">
    </a-widget>
...
```
The widget is rendered only if `widget.name==='awidget'`. Different stuff can be binded to widget directive, but the following bindings are required
- `widget=widget` to bind wiget config object
- `on-delete="$ctrl.deleteWidget(uuid)"` to bind widget delete func
- `on-update="$ctrl.updateWidget(uuid, widget)"` to bind widget config update func
