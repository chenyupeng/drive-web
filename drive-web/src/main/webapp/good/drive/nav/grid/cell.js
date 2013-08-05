'use strict';
goog.provide('good.drive.nav.grid.Cell');

goog.require('goog.dom.classes');
goog.require('goog.string.StringBuffer');
goog.require('goog.ui.Component');

/**
 * @param {good.realtime.CollaborativeMap} data
 * @param {Object} keytype
 * @param {Object} defaultConfig
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
 */
good.drive.nav.grid.Cell =
  function(data, keytype, defaultConfig, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.data = data;
  this.defaultConfig = defaultConfig;
  this.keytype = keytype;
  this.isFolder_ = undefined;
  this.selected_ = false;
  this.bindHandle(data);
};
goog.inherits(good.drive.nav.grid.Cell, goog.ui.Component);


/** */
good.drive.nav.grid.Cell.prototype.renderCell = function() {
  var label = this.getLabelData(this.data);
  var imageData = this.getImageData(this.data);
  var labelElm = goog.dom.createDom('div',
      {'class': 'gv-view-name  dir=ltr'},
      goog.dom.createDom('div', {'dir': 'ltr'}, label));
  this.setLabel(labelElm);
  var checkImage = goog.dom.createDom('div',
      {'class': 'gv-checkbox goog-inline-block'},
      goog.dom.createDom('span',
          {'class': 'jfk-checkbox-checked jfk-checkbox goog-inline-block',
      'role': 'checkbox', 'aria-checked':
        'true', 'tabindex': '0', 'dir': 'ltr'},
      goog.dom.createDom('div',
          {'class': 'jfk-checkbox-checkmark'})));
  goog.dom.appendChild(this.getImageCheckElement(), checkImage);
  goog.dom.appendChild(this.getImageCheckElement(), imageData);
  
};

/**
 * @param {Object} data
 * @return {Element}
 */
good.drive.nav.grid.Cell.prototype.getImageData =
  function(data) {
  var imageFolder = null;
  if (data instanceof good.realtime.CollaborativeMap) {
    if (data.get('isfile') != undefined) {
      if (data.get('thumbnail') != null) {
        return goog.dom.createDom('img', {
          'class' : 'gv-image-el',
          'src' : data.get('thumbnail')
        });
      } else if (data.get('type') == 'audio/mp3') {
        return goog.dom.createDom('img', {
          'class' : 'gv-image-el',
          'src' : './good/images/audio.png'
        });
      } else {
        return goog.dom.createDom('img', {
          'class' : 'gv-image-el',
          'src' : './good/images/generic.png'
        });
      }
    }
  } else {
    if (data['thumbnail'] != undefined) {
      return goog.dom.createDom('img', {
        'class' : 'gv-image-el',
        'src' : data['thumbnail']
      });
    } else if (data.contentType == 'audio/mp3') {
      return goog.dom.createDom('img', {
        'class' : 'gv-image-el',
        'src' : './good/images/audio.png'
      });
    } else {
      return goog.dom.createDom('img', {
        'class' : 'gv-image-el',
        'src' : './good/images/generic.png'
      });
    }

  }
  if (data.get('isclass') == true) {
     imageFolder = goog.dom.createDom('div',
         {'class': 'gv-image-el drive-sprite-folder-grid-shared-icon'});
  } else {
     imageFolder = goog.dom.createDom('div',
         {'class': 'gv-image-el drive-sprite-folder-grid-icon'});
  }
  return goog.dom.createDom('div',
      {'class': 'doclist-gv-thumb-container' +
  ' doclist-gv-thumb-folder'}, imageFolder);
};

/**
 * @param {Object} data
 * @return {string}
 */
good.drive.nav.grid.Cell.prototype.getLabelData = function(data) {
  if (data instanceof good.realtime.CollaborativeMap) {
    return data.get(this.keytype.LABEL[0]);
  }
  return data.filename;
};

/** @override */
good.drive.nav.grid.Cell.prototype.enterDocument = function() {
  good.drive.nav.grid.Cell.superClass_.enterDocument.call(this);
  this.attachEvents_();
};


/** @override */
good.drive.nav.grid.Cell.prototype.exitDocument = function() {
  good.drive.nav.grid.Cell.superClass_.exitDocument.call(this);
  this.detachEvents_();
};

/**
 * @param {Object} data
 */
good.drive.nav.grid.Cell.prototype.bindHandle = function(data) {
  var that = this;
  if (data instanceof good.realtime.CollaborativeMap) {
    data.addValueChangedListener(function(evt) {
      var property = evt.getProperty();
      if (property != 'label') {
        return;
      }
      var newValue = evt.getNewValue();
      var oldValue = evt.getOldValue();
      if (oldValue == null) {
        return;
      }
      that.renderCell();
    });
  }
};

/**
 * @return {boolean}
 */
good.drive.nav.grid.Cell.prototype.isFolder = function() {
  return this.isFolder_;
};

/**
 * @param {boolean} isFolder
 */
good.drive.nav.grid.Cell.prototype.setIsFolder = function(isFolder) {
  this.isFolder_ = isFolder;
};


/**
 * @private
 */
good.drive.nav.grid.Cell.prototype.attachEvents_ = function() {
  var el = this.getElement();

  this.getHandler().
      listen(el, goog.events.EventType.MOUSEOVER, this.handleKeyEvent).
      listen(el, goog.events.EventType.MOUSEOUT, this.handleKeyEvent).
      listen(el, goog.events.EventType.MOUSEDOWN, this.handleKeyEvent).
      listen(el, goog.events.EventType.CLICK, this.clickHandle);
};

/**
 */
good.drive.nav.grid.Cell.prototype.select = function() {
  var view = this.getParent();
  view.setSelectedItem(this);
};

/**
 * @param {boolean} selected
 */
good.drive.nav.grid.Cell.prototype.setSelectedInternal =
  function(selected) {
  if (this.selected_ == selected) {
    return;
  }
  this.selected_ = selected;
  var cellElm = this.getContentElement();
  cellElm.className = this.defaultConfig.cssCellRoot;
};

/**
 * @private
 */
good.drive.nav.grid.Cell.prototype.detachEvents_ = function() {

};


/**
 * @param {goog.events.BrowserEvent} e
 */
good.drive.nav.grid.Cell.prototype.handleKeyEvent = function(e) {
  var el = this.getElement();
  switch (e.type) {
    case goog.events.EventType.MOUSEOVER:
      if (!goog.dom.classes.has(el, this.defaultConfig.cssCellHover)) {
        goog.dom.classes.add(el,
            this.defaultConfig.cssCellHover);
      }
      break;
    case goog.events.EventType.MOUSEOUT:
      if (goog.dom.classes.has(el, this.defaultConfig.cssCellHover)) {
        goog.dom.classes.remove(el,
            this.defaultConfig.cssCellHover);
      }
    case goog.events.EventType.MOUSEDOWN:
      this.select();
      break;
  }
};

/**
 * @param {goog.events.BrowserEvent} e
 */
good.drive.nav.grid.Cell.prototype.clickHandle = function(e) {
  this.openCell();
  var imageCheck = this.getImageCheckElement();
  var rootElement = this.getThumbnailElement();
  goog.events.listen(rootElement, goog.events.EventType.CLICK, function(e) {
    goog.dom.classes.add(rootElement, 'gv-active');
  });
  goog.events.listen(imageCheck, goog.events.EventType.CLICK, function(e) {
    var path = good.drive.nav.folders.Path.getINSTANCE();
    var docId = path.getCurrentDocid;
    var grid = good.drive.nav.grid.View.currentGrid;
    var selectedElemnet = grid.getSelectedItem();
    var data = selectedElemnet.data;
    if(docId !=  good.constants.MYRESDOCID) {
      if (data instanceof good.realtime.CollaborativeMap) {
        if(data.get('isfile') != undefined) {
          good.drive.rightmenu.Rightmenu.PREVIEW(data.get('id'));
        }
      } else {
        good.drive.rightmenu.Rightmenu.PREVIEW(data.id);
      }
    }
  });
};

/**
 */
good.drive.nav.grid.Cell.prototype.openCell = function() {
  if (this.data instanceof good.realtime.CollaborativeMap) {
    if (this.data.get('isfile') != undefined) {
      return;
    }
    var path = good.drive.nav.folders.Path.getINSTANCE().path;
//    var paths = [];
    var pathlist = path[good.drive.nav.folders.Path.NameType.CURRENTPATH];
    var docid = path[good.drive.nav.folders.Path.NameType.CURRENTDOCID];
//    for (var i in pathlist) {
//      paths.push(pathlist[i]);
//    }
    pathlist.push(this.data.getId());
    good.drive.nav.folders.Path.getINSTANCE().putNewPath(path);
  } else {
  }
};

/** @override */
good.drive.nav.grid.Cell.prototype.createDom = function() {
  var sb = new goog.string.StringBuffer();
  this.toHtml(sb);
  var element = this.getDomHelper().htmlToDocumentFragment(sb.toString());
  this.setElementInternal(/** @type {Element} */ (element));
};


/**
 * @param {goog.string.StringBuffer} sb
 */
good.drive.nav.grid.Cell.prototype.toHtml = function(sb) {
  sb.append('<div class="',
      this.defaultConfig.cssCellRoot, '" id="', this.getId(), '">',
      '<div><div class="gv-dynamic-thumbnail"',
      ' style="width: 230px; height: 237px">',
      this.getImageHtml(), this.getLabelHtml(), '</div></div></div>');
};



/**
 * @return {Element}
 */
good.drive.nav.grid.Cell.prototype.getThumbnailElement = function() {
  var el = this.getElement();
  return el ? /** @type {Element} */ (el.firstChild.firstChild) : null;
};


/**
 * @return {Element}
 */
good.drive.nav.grid.Cell.prototype.getImageBottonElement = function() {
  var el = this.getImageElement();
  return el ? /** @type {Element} */ (el.firstChild) : null;
};


/**
 * @return {goog.string.StringBuffer}
 */
good.drive.nav.grid.Cell.prototype.getImageHtml = function() {
  var sb = new goog.string.StringBuffer();
  sb.append('<div class="', this.getImageClassName(),
      '" style="width: 230px;height:213px;">',
      '<div class="gv-view-bottom" style="width:230px;">' +
      '<div class="gv-view-center">',
      '<div class="gv-selection">', this.getImageContainerHtml(),
      '</div></div></div></div>');
  return sb.toString();
};


/**
 * @return {Element}
 */
good.drive.nav.grid.Cell.prototype.getImageElement = function() {
  var el = this.getThumbnailElement();
  return el ? /** @type {Element} */ (el.firstChild) : null;
};


/**
 * @return {string}
 */
good.drive.nav.grid.Cell.prototype.getImageClassName = function() {
  return this.defaultConfig.cssCellImage;
};


/**
 * @return {goog.string.StringBuffer}
 */
good.drive.nav.grid.Cell.prototype.getImageContainerHtml = function() {
  var sb = new goog.string.StringBuffer();
  sb.append('<div class="',
      this.getImageContainerClassName(),
      '">'+ this.getImageCheckHtml() +'</div>');
  return sb.toString();
};


/**
 * @return {Element}
 */
good.drive.nav.grid.Cell.prototype.getImageContainerElement = function() {
  var el = this.getImageBottonElement();
  return el ?
      /** @type {Element} */ (el.firstChild.firstChild.firstChild) :
      null;
};

/**
 * @return {string}
 */
good.drive.nav.grid.Cell.prototype.getImageContainerClassName = function() {
  return this.defaultConfig.cssCellImageContainer;
};

/**
 * @return {goog.string.StringBuffer}
 */
good.drive.nav.grid.Cell.prototype.getImageCheckHtml = function() {
  var sb = new goog.string.StringBuffer();
  sb.append('<a class="gridview-thumbnail-link" target="_blank" rel="noreferrer"></a>');
  return sb.toString();
};

/**
 * @return {Element}
 */
good.drive.nav.grid.Cell.prototype.getImageCheckElement = function() {
  var el = this.getImageContainerElement();
  return el ?
      /** @type {Element} */ (el.firstChild) :
        null;
};


/**
 * @return {goog.string.StringBuffer}
 */
good.drive.nav.grid.Cell.prototype.getLabelHtml = function() {
  var sb = new goog.string.StringBuffer();
  sb.append('<div class="',
      this.getLabelClassName(),
      '"></div>');
  return sb.toString();
};


/**
 * @return {Element}
 */
good.drive.nav.grid.Cell.prototype.getLabelElement = function() {
  var el = this.getThumbnailElement();
  return el ? /** @type {Element} */ (el.lastChild) : null;
};


/**
 * @return {string}
 */
good.drive.nav.grid.Cell.prototype.getLabelClassName = function() {
  return this.defaultConfig.cssCellLabel;
};


/**
 * @param {Element} dom
 */
good.drive.nav.grid.Cell.prototype.setLabel = function(dom) {
//  goog.dom.removeChildren(this.getImageContainerElement());
  goog.dom.removeChildren(this.getLabelElement());
  goog.dom.appendChild(this.getLabelElement(), dom);
};
