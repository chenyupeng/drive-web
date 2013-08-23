'use strict';
goog.provide('good.drive.view.baseview.Cell');

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
good.drive.view.baseview.Cell =
  function(data, keytype, defaultConfig, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
  this.data = data;
  this.defaultConfig = defaultConfig;
  this.keytype = keytype;
  this.isFolder_ = undefined;
  this.selected_ = false;
  var checkImage = undefined;
};
goog.inherits(good.drive.view.baseview.Cell, goog.ui.Component);


/** */
good.drive.view.baseview.Cell.prototype.renderCell = function() {
};


/** @override */
good.drive.view.baseview.Cell.prototype.enterDocument = function() {
  good.drive.view.baseview.Cell.superClass_.enterDocument.call(this);
  this.attachEvents_();
};


/** @override */
good.drive.view.baseview.Cell.prototype.exitDocument = function() {
  good.drive.view.baseview.Cell.superClass_.exitDocument.call(this);
  this.detachEvents_();
};

/**
 * @return {boolean}
 */
good.drive.view.baseview.Cell.prototype.isFolder = function() {
  return this.isFolder_;
};

/**
 * @param {boolean} isFolder
 */
good.drive.view.baseview.Cell.prototype.setIsFolder = function(isFolder) {
  this.isFolder_ = isFolder;
};

/**
 * @private
 */
good.drive.view.baseview.Cell.prototype.attachEvents_ = function() {
  var el = this.getElement();
  var checkImage = this.getCheckImageElement();
  var checkBox = this.getCheckbox();
  this.getHandler().
      listen(el, goog.events.EventType.MOUSEOVER, this.handleKeyEvent).
      listen(el, goog.events.EventType.MOUSEOUT, this.handleKeyEvent).
      listen(el, goog.events.EventType.MOUSEDOWN, this.handleKeyEvent).
      listen(el, goog.events.EventType.CLICK, this.clickHandle).
      listen(checkImage, goog.events.EventType.CLICK, this.clickImageHandle).
      listen(checkBox, goog.events.EventType.CLICK, this.clickBoxHandle);
};

/**
 * @param {goog.events.BrowserEvent} e
 */
good.drive.view.baseview.Cell.prototype.clickImageHandle = function(e) {
  e.stopPropagation();
  this.select();
  this.checkImage = true;
  this.openCell();
};

/**
 */
good.drive.view.baseview.Cell.prototype.openCell = function() {
  if (this.data instanceof good.realtime.CollaborativeMap) {
    if (this.data.get('isfile') != undefined) {
      if (this.checkImage != true) {
        good.drive.rightmenu.Rightmenu.PREVIEW(this.data.get('id'));
        this.buildPlayPath();
        return;
      } else {
        var preview = new good.drive.preview.Control();
        preview.getselcetItem();
        return;
      }
    }
    var newPath = {};
    var path = good.drive.nav.folders.Path.getINSTANCE().path;
    var pathlist = path[good.drive.nav.folders.Path.NameType.CURRENTPATH];
    var docid = path[good.drive.nav.folders.Path.NameType.CURRENTDOCID];
    pathlist.push(this.data.getId());
    newPath[good.drive.nav.folders.Path.NameType.CURRENTPATH] = pathlist;
    newPath[good.drive.nav.folders.Path.NameType.CURRENTDOCID] = docid;
    good.drive.nav.folders.Path.getINSTANCE().putNewPath(newPath);
  } else {
    if (this.checkImage != true) {
      good.drive.rightmenu.Rightmenu.PREVIEW(this.data.id);
      this.buildPlayPath();
      return;
    } else {
      var preview = new good.drive.preview.Control();
      preview.getselcetItem();
      this.checkImage = false;
      return;
    }
  }
};

/**
 */
good.drive.view.baseview.Cell.prototype.buildPlayPath = function() {
  var root = good.drive.nav.folders.Path.getINSTANCE().root;
  var list = root.get(good.drive.nav.folders.Path.NameType.PLAYFILE);
  var file = {};
  var that = this;
  if (this.data instanceof good.realtime.CollaborativeMap) {
    goog.array.forEach(this.data.keys(), function(key) {
      file[key] = that.data.get(key);
    });
  } else {
    goog.object.forEach(this.data, function(value, key) {
      if (key == 'filename') {
        file['label'] = value;
        return;
      }
      if (key == 'contentType') {
        file['type'] = value;
        return;
      }
      file[key] = value;
    });
  }
  list.push(file);
};

/**
 * @return {Element}
 */
good.drive.view.baseview.Cell.prototype.getCheckbox = function() {
  return this.getElement();
};

/**
 * @return {Element}
 */
good.drive.view.baseview.Cell.prototype.getCheckImageElement = function() {
  return this.getElement();
};

/**
 */
good.drive.view.baseview.Cell.prototype.select = function() {
  if (this.isSelected()) {
    return;
  }
  var view = this.getParent();
  view.setSelectedItem(this);
  this.getCheckStyle();
  var root = good.drive.nav.folders.Path.getINSTANCE().root;
  root.set(good.drive.nav.folders.Path.NameType.SELECT, true);
};

/**
 */
good.drive.view.baseview.Cell.prototype.deSelect = function() {
  if (!this.isSelected()) {
    return;
  }
  var view = this.getParent();
  view.setDeSelectedItem(this);
  this.getCheckStyle();
  if (goog.array.isEmpty(this.getParent().checkList)) {
    var root = good.drive.nav.folders.Path.getINSTANCE().root;
    root.set(good.drive.nav.folders.Path.NameType.SELECT, false);
  }
};

/**
 * @return {boolean}
 */
good.drive.view.baseview.Cell.prototype.isSelected = function() {
  return this.selected_;
};

/**
 * @param {boolean} selected
 */
good.drive.view.baseview.Cell.prototype.setSelectedInternal =
  function(selected) {
  if (this.selected_ == selected) {
    return;
  }
  this.selected_ = selected;
};

/**
 * @private
 */
good.drive.view.baseview.Cell.prototype.detachEvents_ = function() {

};

/**
 * @param {goog.events.BrowserEvent} e
 */
good.drive.view.baseview.Cell.prototype.handleKeyEvent = function(e) {
	var el = this.getElement();
	var className = this.cellHover(); 
	  switch (e.type) {
	    case goog.events.EventType.MOUSEOVER:
	      if (!goog.dom.classes.has(el, className)) {
	        goog.dom.classes.add(el, className);
	      }
	      break;
	    case goog.events.EventType.MOUSEOUT:
	      if (goog.dom.classes.has(el, className)) {
	        goog.dom.classes.remove(el, className);
	      }
	      break;
	    case goog.events.EventType.MOUSEDOWN:
	      if (e.button == 2) {
	        this.clickHandle(e);
	      }
	      break;
	  }
};

/**
 * @return {string}
 */
good.drive.view.baseview.Cell.prototype.cellHover = function() {
	return;
};
/**
 * @param {goog.events.BrowserEvent} e
 */
good.drive.view.baseview.Cell.prototype.clickHandle = function(e) {
  e.stopPropagation();
  var listClick = this.getParent().checkList;
  if (listClick.length > 0) {
    var that = this;
    var bakListClick = goog.array.clone(listClick);
    goog.array.forEach(bakListClick, function(cell) {
      if (that == cell) {
        return;
      }
      cell.deSelect();
    });
  }
  if (this.selected_ == false) {
    this.select();
  }
};

/**
 * @param {goog.events.BrowserEvent} e
 */
good.drive.view.baseview.Cell.prototype.clickBoxHandle = function(e) {
  e.stopPropagation();
  if (this.selected_ != true) {
    this.select();
  } else {
    this.deSelect();
  }
};

/**
 */
good.drive.view.baseview.Cell.prototype.getCheckStyle = function() {
  var checkElement = this.getCheckbox().firstChild;
  if (!goog.dom.classes.has(checkElement, 'jfk-checkbox-checked')) {
    goog.dom.classes.remove(checkElement, 'jfk-checkbox-unchecked');
    goog.dom.classes.add(checkElement, 'jfk-checkbox-checked');
  } else {
    goog.dom.classes.remove(checkElement, 'jfk-checkbox-checked');
    goog.dom.classes.add(checkElement, 'jfk-checkbox-unchecked');
  }
};

/** @override */
good.drive.view.baseview.Cell.prototype.createDom = function() {
  var sb = new goog.string.StringBuffer();
  this.toHtml(sb);
  var element = this.getDomHelper().htmlToDocumentFragment(sb.toString());
  this.setElementInternal(/** @type {Element} */ (element));
};


/**
 * @param {goog.string.StringBuffer} sb
 */
good.drive.view.baseview.Cell.prototype.toHtml = function(sb) {
};
