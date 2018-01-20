/*global $, window, document*/

class Draggable {

  constructor() {
    this.restrict = 'EA';
  }

  link(scope, element) {
    $(element).bind('mouseup', function(ui) {
      var elements = document.getElementsByClassName('opened');
      for (let i = 0; i < elements.length; i++) {
        if (!elements[i].style.zIndex) {
          elements[i].style.zIndex = 10001;
        }
      }
      if (window.topZ) {
        window.topZ++;
        ui.currentTarget.style.zIndex = window.topZ;
      } else {
        ui.currentTarget.style.zIndex++;
        window.topZ = ui.currentTarget.style.zIndex;
      }
      ui.currentTarget.style.opacity = 1;
    });

    $(element).draggable({
      cancel: '.homer-modal-body, .close',
      handle: '.homer-modal-header',
      start: function(event, ui) {
        ui.helper[0].style.opacity = 0.7;
        var elements = document.getElementsByClassName('opened');
        for (let i = 0; i < elements.length; i++) {
          if (!elements[i].style.zIndex) {
            elements[i].style.zIndex = 10001;
          }
        }
        if (window.topZ) {
          window.topZ++;
          ui.helper[0].style.zIndex = window.topZ;
        } else {
          ui.helper[0].style.zIndex++;
          window.topZ = ui.helper[0].style.zIndex;
        }
      },
      stop: function(event, ui) {
        if (ui.helper[0]) {
          ui.helper[0].style.opacity = 1;
          if (ui.offset.top < 0) ui.helper[0].style.top = '0px';
          if (ui.offset.left < 0) {
            if ((ui.helper[0].offsetWidth + ui.offset.left) < 100) ui.helper[0].style.left = '-' + (ui.helper[0].offsetWidth - 100) + 'px';
          }
          if ((ui.offset.left + 100) > window.innerWidth) {
            ui.helper[0].style.left = (window.innerWidth - 100) + 'px';
            window.scrollTo(0, 0);
          }
          if ((ui.offset.top + 50) > window.innerHeight) {
            ui.helper[0].style.top = (window.innerHeight - 50) + 'px';
            window.scrollTo(0, 0);
          }

        }
      }
    }).resizable({
      resize: function(evt, ui) {
        var messagebody = $(element).find('.homer-modal-body');
        $(messagebody).width(ui.size.width - 10); /* 10 */
        $(messagebody).height(ui.size.height - 80); /* 50 */
      }
    });
  }
}

export default Draggable;
