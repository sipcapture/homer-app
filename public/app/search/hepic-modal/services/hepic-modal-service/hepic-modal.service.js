class HepicModalService {
  constructor() {
  }

  toggleFullscreen(modalId) {
    this.modalHeader = $(`[homer-modal="${modalId}"]`);
    this.modalContent = this.modalHeader.find('.modal-content');
    this.modalBody = this.modalHeader.find('.modal-body');

    if (!this.modalContent[0].hepic) {
      this.modalContent[0].hepic = {};
    }
    if (!this.modalBody[0].hepic) {
      this.modalBody[0].hepic = {};
    }

    if (!this.modalContent.hasClass('full-screen-modal')) {
      this._savePosition();
      this._saveSize();
      this._switchOnFullscreen();
    } else {
      this._switchOffFullscreen();
    }
  }

  _savePosition() {
    this.modalContent[0].hepic.extop = this.modalContent.position().top;
    this.modalContent[0].hepic.exleft = this.modalContent.position().left;
    this.modalBody[0].hepic.extop = this.modalBody.position().top;
    this.modalBody[0].hepic.exleft = this.modalBody.position().left;
  }
  
  _saveSize() {
    this.modalContent[0].hepic.exwidth = this.modalContent.width();
    this.modalContent[0].hepic.exheight = this.modalContent.height();
    this.modalBody[0].hepic.exwidth = this.modalBody.width();
    this.modalBody[0].hepic.exheight = this.modalBody.height();
  }
  
  _fitBody() {
    this.modalBody.css({
      width: '100%',
      height: '100%',
    });
  }

  _switchOnFullscreen() {
    this.modalContent.addClass('full-screen-modal');
    this.modalContent.css({
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
    });
    this._fitBody();
  }
  
  _switchOffFullscreen() {
    this.modalContent.removeClass('full-screen-modal');
    this.modalContent.css({
      top: this.modalContent[0].hepic.extop || window.innerHeight * 0.1,
      left: this.modalContent[0].hepic.exleft || window.innerWidth * 0.2,
      width: this.modalContent[0].hepic.exwidth || window.innerWidth * 0.7,
      height: this.modalContent[0].hepic.exheight || window.innerHeight * 0.5,
    });
    this._fitBody();
  }
}

export default HepicModalService;
