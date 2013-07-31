'use strict';
goog.provide('good.drive.nav.menu');

goog.require('good.drive.nav.menu.ViewRenderer');
goog.require('goog.dom');
goog.require('goog.positioning.Corner');
goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItemRenderer');
goog.require('goog.ui.PopupMenu');
goog.require('goog.ui.SubMenu');
goog.require('goog.ui.registry');

/**
 * @constructor
 */
good.drive.nav.menu.View = function() {
  var render = goog.ui.ContainerRenderer.getCustomRenderer(
      good.drive.nav.menu.ViewRenderer, 'detroit-createmenu');
  var itemRender = goog.ui.ControlRenderer.getCustomRenderer(
      goog.ui.MenuItemRenderer, 'detroit-createmenuitem');
  goog.ui.registry.setDecoratorByClassName(
      'detroit-createmenuitem', function() {
        return new goog.ui.MenuItem('', null, null, itemRender);
      });
  var create = new goog.ui.PopupMenu(null, render);
  create.decorateContent = function(element) {
    var renderer = this.getRenderer();
    var contentElements = this.getDomHelper().getElementsByTagNameAndClass(
        'div', goog.getCssName(renderer.getCssClass(), 'entries-col'),
        element);
    var length = contentElements.length;
    for (var i = 0; i < length; i++) {
      renderer.decorateChildren(this, contentElements[i]);
    }
  };
  create.setToggleMode(true);
  create.decorate(goog.dom.getElement('dMenu'));
  this.create_ = create;


  var left = new goog.ui.PopupMenu();
  left.decorate(goog.dom.getElement('leftsubmenu'));
  this.left_ = left;
};
/**
 * @param {Element} dom
 * @param {Array.<Array>} items [['i', ''], ['s', '']]
 * @param {Function} handle
 * @param {Object} corner {targetCorner: ,menuCorner: contextMenu:}
 * @param {Element} target
 * @return {goog.ui.PopupMenu}
 */
good.drive.nav.menu.View.prototype.genPopupMenu =
  function(dom, items, handle, corner, target) {
  var popupMenu = new goog.ui.PopupMenu();
  this.genItems_(popupMenu, items);
  popupMenu.setToggleMode(true);
  popupMenu.render(target == undefined ? document.body : target);
  if (corner == undefined) {
    popupMenu.attach(dom, goog.positioning.Corner.BOTTOM_LEFT,
        goog.positioning.Corner.TOP_LEFT);
  } else {
    popupMenu.attach(dom, corner.targetCorner,
        corner.menuCorner, corner.contextMenu);
  }
  goog.events.listen(popupMenu, 'action', handle);
  return popupMenu;
};

/**
 * @param {goog.ui.PopupMenu} popup
 * @param {Array.<Array>} items [['i', ''], ['s', '']]
 * @param {Function} handle
 * @return {goog.ui.PopupMenu}
 */
good.drive.nav.menu.View.prototype.reload = function(popupMenu, items, handle) {
  this.genItems_(popupMenu, items);
  if (handel == undefined) {
    return;
  }
  goog.events.listen(popupMenu, 'action', handle);
};

good.drive.nav.menu.View.prototype.genItems_ = function(popupMenu, items) {
  goog.array.forEach(items, function(value) {
    switch (value[0]) {
    case 's':
      popupMenu.addItem(new goog.ui.MenuSeparator());
      break;
    case 'i':
      popupMenu.addItem(new goog.ui.MenuItem(value[1]));
      break;
    case 'm':
      popupMenu.addItem(value[1]);
      break;
    default:
      break;
    }
  });
}

/**
 * @param {Element} dom
 * @param {Function} handle
 * @return {goog.ui.PopupMenu}
 */
good.drive.nav.menu.View.prototype.createPopup = function(dom, handle) {
  this.create_.attach(dom, goog.positioning.Corner.BOTTOM_LEFT,
      goog.positioning.Corner.TOP_LEFT);
  goog.events.listen(this.create_, 'action', handle);
  return this.create_;
};

/**
 * @param {Element} dom
 * @param {Function} handle
 * @return {goog.ui.PopupMenu}
 */
good.drive.nav.menu.View.prototype.leftSubMenu = function(dom, handle) {
  this.left_.attach(dom, undefined, undefined, true);
  this.left_.getHandler().listen(
      this.left_, goog.ui.Menu.EventType.BEFORE_SHOW, function(e) {
    var str = '';
  });
  goog.events.listen(this.left_, 'action', handle);
  return this.left_;
};
