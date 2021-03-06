'use strict';
goog.provide('good.drive.preview.previewcontrol');

goog.require('good.constants');
goog.require('good.net.CrossDomainRpc');
goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.events');

/**
 * 文件预览控制类
 * @constructor
 */
good.drive.preview.Control = function() {
  var prev_button = goog.dom.getElement('prev_button');
  var next_button = goog.dom.getElement('next_button');
  var print_button = goog.dom.getElement('print_button');
  this._next_button = next_button;
  this._prev_button = prev_button;
  this._print_button = print_button;
};

/** @type {string} */
good.drive.preview.Control.PREVID = undefined;

/** @type {string} */
good.drive.preview.Control.NEXTID = undefined;

/** @type {good.drive.view.baseview.View} */
good.drive.preview.Control.GRID = undefined;

/** @type {Array.<string>} */
good.drive.preview.Control.GRIDLISTIDS = undefined;

/** @type {boolean} */
good.drive.preview.Control.OBJECTFLAG = false;

/**
 * 初始化文件预览绑定的Action
 */
good.drive.preview.Control.prototype.init = function() {
  this.prev();
  this.next();
  this.closepreview();
  this.print();
};

/**
 * 绑定预览页面上页按钮Action
 */
good.drive.preview.Control.prototype.prev = function() {
  var that = this;
  goog.events.listen(that._prev_button, goog.events.EventType.CLICK,
      function(e) {
        var grid = good.drive.preview.Control.GRID;
        if (good.drive.preview.Control.PREVID != undefined) {
          var preItem = grid.getChild(good.drive.preview.Control.PREVID);
          that.display(good.drive.preview.Control.PREVID);
          var data = preItem.data;
          if (data instanceof good.realtime.CollaborativeMap) {
            that.preview(data.get('id'));
          } else {
            that.preview(data.id);
          }
        }
      });
};


/**
 * 绑定预览页面下页按钮Action
 */
good.drive.preview.Control.prototype.next = function() {
  var that = this;
  goog.events.listen(that._next_button, goog.events.EventType.CLICK,
      function(e) {
        var grid = good.drive.preview.Control.GRID;
        if (good.drive.preview.Control.NEXTID != undefined) {
          var preItem = grid.getChild(good.drive.preview.Control.NEXTID);
          that.display(good.drive.preview.Control.NEXTID);
          var data = preItem.data;
          if (data instanceof good.realtime.CollaborativeMap) {
            that.preview(data.get('id'));
          } else {
            that.preview(data.id);
          }
        }
      });
};

/**
* 绑定文件预览页面关闭按钮Action
*/
good.drive.preview.Control.prototype.closepreview = function() {
 var preview_close = goog.dom.getElement('preview_close');
 var previewdiv = goog.dom.getElement('previewdiv');
 goog.events.listen(preview_close, goog.events.EventType.CLICK, function(e) {
   previewdiv.style.display = 'none';
 });
};

/**
* 绑定文件打印按钮Action
*/
good.drive.preview.Control.prototype.print = function() {
 var that = this;
 goog.events.listen(that._print_button, goog.events.EventType.CLICK,
     function(e) {
   var imgpreview = goog.dom.getElement('imgpreview');
   var imgsrc = imgpreview.src;
   var uri = new goog.Uri('print.html');
   uri.setParameterValue('SRC', imgsrc);
   window.open(uri);
 });
};

/**
 * 取得选中的信息
 */
good.drive.preview.Control.prototype.getselcetItem = function() {
  var that = this;
  var path = good.drive.nav.folders.Path.getINSTANCE();
  var docId = path.currentDocId;
  if (docId != good.constants.OTHERDOCID) {
    var grid = good.drive.view.baseview.View.currentGrid;
    good.drive.preview.Control.GRID = grid;
    if (docId == good.constants.PUBLICRESDOCID) {
      //公共资料库的选中的信息取得
      var childlistIds = grid.getChildIds();
      good.drive.preview.Control.GRIDLISTIDS = childlistIds;
      var selectedElemnet = grid.getSelectedItem();
      var selectedItemId = selectedElemnet.getId();
      that.display(selectedItemId);
      var data = selectedElemnet.data;
      that.preview(data.id);
    } else {
      //课程或者收藏夹的所有资源信息的取得
      var childlistIds = grid.getChildIds();
      var dataListIds = new Array();
      //去掉文件夹的内容
      goog.array.forEach(childlistIds, function(item) {
        var cell = grid.getChild(item);
        if (cell.data.get('isfile') != undefined) {
          dataListIds.push(item);
        }
      });
      good.drive.preview.Control.GRIDLISTIDS = dataListIds;
      var selectedElemnet = grid.getSelectedItem();
      var selectedItemId = selectedElemnet.getId();
      that.display(selectedItemId);
      var data = selectedElemnet.data;
      that.preview(data.get('id'));
    }
   }
};

/**
 * 预览界面按钮显示控制
 * @param {string} id
 */
good.drive.preview.Control.prototype.display = function(id) {
  var that = this;
  var childlistId = good.drive.preview.Control.GRIDLISTIDS;
  var index = goog.array.indexOf(childlistId, id);
  if (index == 0) {
    that._prev_button.style.display = 'none';
    that._next_button.style.display = 'block';
    good.drive.preview.Control.PREVID = undefined;
    good.drive.preview.Control.NEXTID = childlistId[index + 1];
  } else if (index == (childlistId.length - 1)) {
    that._prev_button.style.display = 'block';
    that._next_button.style.display = 'none';
    good.drive.preview.Control.PREVID = childlistId[index - 1];
    good.drive.preview.Control.NEXTID = undefined;
  } else {
    that._prev_button.style.display = 'block';
    that._next_button.style.display = 'block';
    good.drive.preview.Control.PREVID = childlistId[index - 1];
    good.drive.preview.Control.NEXTID = childlistId[index + 1];
  }
};

 /**
 * 预览内容显示
 * @param {string} fileId
 */
good.drive.preview.Control.prototype.preview = function(fileId) {
  var that = this;
  var previewdiv = goog.dom.getElement('previewdiv');
  var imgplayer_div = goog.dom.getElement('imgplayer');
  var imgpreview = goog.dom.getElement('imgpreview');
  var unknown_div = goog.dom.getElement('unknown_div');
  var view_print = goog.dom.getElement('view_print');

  var flashplayer_div = goog.dom.getElement('flashplayer');
  var objectplay = goog.dom.getElement('objectplay');
  //构建显示的URI
  var uri = new goog.Uri(good.constants.SERVERADRESS);
  uri.setPath('serve');
  uri.setQuery('id');
  uri = uri.toString() + '=' + fileId;
  var rpc = new good.net.CrossDomainRpc('GET',
      good.constants.NAME,
      good.constants.VERSION, 'attachment/' + fileId,
      good.constants.SERVERADRESS);
  rpc.send(function(json) {
    if (json && !json['error']) {
      var contentType = json['contentType'];
      //根据不同的文件类型显示不同的预览界面
      if (contentType == 'application/x-shockwave-flash') {
        imgplayer_div.style.display = 'none';
        unknown_div.style.display = 'none';
        flashplayer_div.style.display = 'block';
        view_print.style.display = 'none';
        if (good.drive.preview.Control.OBJECTFLAG) {
          var movie = goog.dom.getElement('movie');
          movie.value = uri;
          //区分不同浏览器设置
          if (!goog.userAgent.IE) {
            var embedflash = goog.dom.getElement('embedflash');
            embedflash.src = uri;
            embedflash.style.display = 'block';
           }
        } else {
          objectplay.innerHTML = that.getobject(uri);
          good.drive.preview.Control.OBJECTFLAG = true;
        }
      } else if (contentType.indexOf('image/') != -1) {
        //图片类型文件显示
        imgplayer_div.style.display = 'block';
        flashplayer_div.style.display = 'none';
        unknown_div.style.display = 'none';
        view_print.style.display = 'block';
        imgpreview.src = uri;
      } else if (contentType == 'application/x-print') {
        //手偶类型文件显示
        imgplayer_div.style.display = 'block';
        flashplayer_div.style.display = 'none';
        unknown_div.style.display = 'none';
        view_print.style.display = 'block';
        imgpreview.src = uri;
      } else {
        //其他类型文件显示不可预览
        unknown_div.style.display = 'block';
        imgplayer_div.style.display = 'none';
        flashplayer_div.style.display = 'none';
        view_print.style.display = 'none';
      }
      previewdiv.style.display = 'block';
    }
  });
};

/**
 * 点击预览的时构建flash文件显示对话框
 * @param {string} uri
 * @return {String}
 */
good.drive.preview.Control.prototype.getobject = function(uri) {
  var o = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ' +
  'codebase="' +
  'http://active.macromedia.com/flash2/cabs/swflash.cab#version=4,0,0,0" ' +
  'id="Myflash" width=540 height=360> ' +
  '<param id="movie" name=movie value="' + uri + '"> ' +
  '<param name=quality value=high> ' +
  '<param name=play value=false> ' +
  '<param name=autoplay value=true> ' +
  '<param name=bgcolor value=#FFFFFF> ' +
  '<embed id="embedflash" ' +
  'play="false" swliveconnect="true" controller="true" ' +
  'name="Myflash" src="' + uri + '" ' +
  'quality=high bgcolor=#FFFFFF ' +
  'width=540 height=360 type="application/x-shockwave-flash" ' +
  'pluginspage="http://get.adobe.com/cn/flashplayer/"> </embed > ' +
  '</object>';
  return o;
};
