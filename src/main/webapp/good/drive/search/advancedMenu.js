'use strict';
goog.provide('good.drive.search');

goog.require('good.constants');
goog.require('good.drive.search.rigthmenu');
goog.require('good.drive.view.baseview');
goog.require('good.drive.view.table');
goog.require('good.net.CrossDomainRpc');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Popup');
goog.require('goog.ui.PopupMenu');

/**
 * 公共资料库查询类
 * @constructor
 */
good.drive.search.AdvancedMenu = function() {

  var search_input = goog.dom.getElement('search_input');

  var input_text = goog.dom.getElement('gbqfq');

  var search_btn = goog.dom.getElement('gbqfb');

  var popupElt = goog.dom.getElement('search_menu');

  var pop = new goog.ui.PopupMenu();
  popupElt.style.minWidth = '509px';

  //列表显示初始化Table
  var list = good.drive.search.AdvancedMenu.SEARCHLIST;
  if (list == undefined) {
    list = new good.drive.view.table.View({'select': 'select',
      'filename': '名字'});
    list.render(goog.dom.getElement('viewmanager'));
    good.drive.search.AdvancedMenu.SEARCHLIST = list;
    good.drive.view.baseview.View.visiable(list);
    list.setRemote(true);
    //滚动条翻页
    list.scrollToEnd = function() {
      that.nextpage();
    };
  }
  var that = this;
  //网格显示初始化Grid
  var grid = good.drive.search.AdvancedMenu.SEARCHGRID;
  if (grid == undefined) {
    grid = new good.drive.view.grid.View();
    grid.render(goog.dom.getElement('viewmanager'));
    good.drive.search.AdvancedMenu.SEARCHGRID = grid;
    good.drive.view.baseview.View.visiable(grid);
    grid.setRemote(true);
    //滚动条翻页
    grid.scrollToEnd = function() {
      that.nextpage();
    };
  }
  this._typeArray = good.constants.TYPEARRAY;
  this._fieldArray = good.constants.FIELDARRAY;
  this._gradeArray = good.constants.GRADEARRAY;
  this._pop = pop;
  this._search_input = search_input;
  this._input_text = input_text;
  this._search_btn = search_btn;
};

/** @type {good.drive.view.baseview.View} */
good.drive.search.AdvancedMenu.SEARCHGRID = undefined;
/** @type {good.drive.view.baseview.View} */
good.drive.search.AdvancedMenu.SEARCHLIST = undefined;

/** @type {string} */
good.drive.search.AdvancedMenu.NEXTPAGETOKEN = undefined;

/**
 * 初始化
 */
good.drive.search.AdvancedMenu.prototype.init = function() {
  this.createPopMenu();
  this.popaction();
  this.clearAction();
  this.inputAction();
  this.searchbtncick();
};


/**
 * 创建高级搜索的popmenu
 */
good.drive.search.AdvancedMenu.prototype.createPopMenu = function() {
  var btn = goog.dom.getElement('advanced-search-button-container');
  var popupElt = goog.dom.getElement('search_menu');

  popupElt.style.minWidth = '509px';
  this._pop.decorateContent = function(element) {
    var renderer = this.getRenderer();
    var contentElements = this.getDomHelper().
    getElementsByTagNameAndClass('div',
        'select', element);

    // Some versions of IE do not like it when you access this nodeList
    // with invalid indices. See
    // http://code.google.com/p/closure-library/issues/detail?id=373
    var length = contentElements.length;
    for (var i = 0; i < length; i++) {
      renderer.decorateChildren(this, contentElements[i]);
    }
  };

  this._pop.setToggleMode(true);
  this._pop.decorate(popupElt);

  this._pop.attach(
      btn,
      goog.positioning.Corner.BOTTOM_RIGHT,
      goog.positioning.Corner.TOP_RIGHT);
};

/**
 * 高级搜索类型、领域、年级选择查询响应按钮
 */
good.drive.search.AdvancedMenu.prototype.popaction = function() {
  var that = this;
  goog.events.listen(this._pop, 'action', function(e) {
    var title = e.target.element_.innerText;
    title = that.trim(title);
    that.createCondition(title);
    that.inputstyle();
    that.search();
  });
};


/**
 * 选择标签时搜索栏中创建对应的查询标签，并绑定删除按钮Action
 * @param {string} title
 */
good.drive.search.AdvancedMenu.prototype.createCondition = function(title) {
  var that = this;
  if (title != null && title != '') {
    if (title != '类型' && title != '领域' && title != '年级') {
      var div = goog.dom.createDom('div',
          {'class': 'goog-inline-block filter-chip',
            'title': '在' +
            title +
            '过滤器。使用退格或 Delete 键可以删除'},null);
      var span_title = goog.dom.createDom('span',
          {'class': 'goog-inline-block filter-chip-label'},
          title);
      var span_clean = goog.dom.createDom('span',
          {'class': 'goog-inline-block filter-chip-x'},'×');
      div.appendChild(span_title);
      div.appendChild(span_clean);

      var array = that.getArray(title);
      var index = that.ishave(array);

      if (index == -1) {
        that._search_input.appendChild(div);
      } else {
        var oldNode = that._search_input.children[index];
        goog.dom.replaceNode(div, oldNode);
      }
      goog.events.listen(span_clean,
          goog.events.EventType.CLICK, function(e) {
        goog.dom.removeNode(e.target.parentElement);
        that.inputstyle();
        that.search();
      });
    }
  }
};

/**
 * 绑定删除按钮Action
 */
good.drive.search.AdvancedMenu.prototype.clearAction = function() {
  var that = this;
  var clear_container = goog.dom.
  getElement('search-input-clear-container');
  goog.events.listen(clear_container,
      goog.events.EventType.CLICK, function(e) {
    goog.dom.removeChildren(that._search_input);
    that._input_text.value = '';
    that.inputstyle();
    that.search();
  });
};

/**
 * 判断时候包含相同类型的标签工具类
 * @param {Array} array
 * @return {number}
 */
good.drive.search.AdvancedMenu.prototype.ishave = function(array) {
  if (this._search_input.children.length != 0) {
    for (var i = 0; i < this._search_input.children.length; i++) {
      var child = this._search_input.children[i];
      var spantext = child.children[0].innerText;
      if (goog.array.contains(array, spantext)) {
        return i;
      }
    }
  }
  return -1;
};

/**
 * 根据标签内容取得同一类型的所有内容项
 * @param {string} str
 * @return {Array.<string>}
 */
good.drive.search.AdvancedMenu.prototype.getArray = function(str) {
  if (goog.array.contains(this._typeArray, str)) {
    return this._typeArray;
  } else if (goog.array.contains(this._fieldArray, str)) {
    return this._fieldArray;
  } else {
    return this._gradeArray;
  }
};

/**
 * 根据选择标签的个数设定输入框的长短
 */
good.drive.search.AdvancedMenu.prototype.inputstyle = function() {
  var input_div = goog.dom.getElement('gbqfqwb');
  var input = this.trim(this._input_text.value);
  var clear_container = goog.dom.
  getElement('search-input-clear-container').children[0];

  if (this._search_input.children.length === 0) {
      input_div.style.left = '1px';
      input_div.style.width = '471px';
      if (input == null || input == '') {
        clear_container.style.display = 'none';
      } else {
        clear_container.style.display = 'block';
      }
   } else {
       if (this._search_input.children.length === 1) {
         input_div.style.left = '51px';
         input_div.style.width = '401px';
       } else if (this._search_input.children.length === 2) {
         input_div.style.left = '101px';
         input_div.style.width = '351px';
       } else if (this._search_input.children.length === 3) {
         input_div.style.left = '151px';
         input_div.style.width = '301px';
       }
      clear_container.style.display = 'block';
  }
};

/**
 * 绑定查询输入框Action
 */
good.drive.search.AdvancedMenu.prototype.inputAction = function() {
  var that = this;
  var DOM_EVENTS = ['keydown', 'keyup', 'keypress', 'change', 'cut', 'paste',
                    'drop', 'input'];
  goog.events.listen(that._input_text, DOM_EVENTS, function(e) {
    that.inputstyle();
  });
};

/**
 * @param {string} str
 * @return {string}
 */
good.drive.search.AdvancedMenu.prototype.trim = function(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
};


/**
 * 查询数据并显示
 * @param {string} search_type
 */
good.drive.search.AdvancedMenu.prototype.search = function(search_type) {
  //当前PATH不是公共资料库是点击查询按钮时后台默认修改PATH指向公共资料库
  var path = good.drive.nav.folders.Path.getINSTANCE();
  var docId = path.currentDocId;
  if (docId != good.constants.PUBLICRESDOCID) {
    path.initCallBack(good.constants.PUBLICRESDOCID);
//    var pathlist = good.drive.nav.folders.Path.getINSTANCE().pathlist;
//    pathlist.push('root');
  }
  var that = this;
  //取得查询path
  var path = that.getPath();
    var grid = good.drive.view.baseview.View.isGrid ?
        good.drive.search.AdvancedMenu.SEARCHGRID :
          good.drive.search.AdvancedMenu.SEARCHLIST;

    if (search_type == undefined && path == 'search?limit=20') {
      grid.clear();
      good.drive.view.baseview.View.visiable(grid);
      return;
    } else {
    //连接服务器查询
      var rpc = new good.net.CrossDomainRpc('GET',
          good.constants.NAME,
          good.constants.VERSION, path,
          good.constants.SERVERADRESS);
      rpc.send(function(json) {
        //填充网格数据
        if (json && !json['error']) {
          grid.clear();
          if (json['items'] != undefined) {
            goog.array.forEach(json['items'], function(item) {
              if (item['thumbnail'] != undefined) {
                if (good.constants.DRIVE_SERVER.indexOf('.goodow.com') == -1) {
                  var uri_server = new goog.Uri(good.constants.DRIVE_SERVER);
                  var uri = new goog.Uri(item['thumbnail']);
                  uri.setDomain(uri_server.getDomain());
                  uri.setScheme(uri_server.getScheme());
                  uri.setScheme(uri_server.getScheme());
                  uri.setPort(uri_server.getPort());
                  item['thumbnail'] = uri.toString();
                } else {
                  item['thumbnail'] = item['thumbnail'];
                }
              }
              var cell = grid.createCell(item);
              cell.getLabelData = function(data) {
                return data.filename;
              };
              grid.add(cell);
              cell.renderCell();
            });
          }
          if (json['nextPageToken'] != undefined) {
            good.drive.search.AdvancedMenu.NEXTPAGETOKEN =
              json['nextPageToken'];
          }
          good.drive.view.baseview.View.visiable(grid);
        }
      });
    }
};

/**
 * 根据查询搜索框中的选中内容组件查询path
 * @return {string}
 */
good.drive.search.AdvancedMenu.prototype.getPath = function() {

  var that = this;

  var contentType = undefined;
  var tags = new Array();
  if (that._search_input.children.length != 0) {
    for (var i = 0; i < this._search_input.children.length; i++) {
      var child = that._search_input.children[i];
      var spantext = child.children[0].innerText;
      if (goog.array.contains(this._typeArray, spantext)) {
        contentType = good.constants.TYPE[spantext];
      } else {
        goog.array.insert(tags, spantext);
      }
    }
  }

    var inputval = that._input_text.value;

    //组织查询条件
    var path = 'search';
    var flag = false;
    if (contentType != undefined) {
      path = path + '?contentType=' + contentType;
      flag = true;
    }
    if (!goog.array.isEmpty(tags)) {
      goog.array.forEach(tags, function(e) {
        if (flag) {
          path = path + '&tags=' + encodeURIComponent(e);
          flag = true;
        } else {
          path = path + '?tags=' + encodeURIComponent(e);
          flag = true;
        }
      });
    }

    if (inputval != null && inputval != '') {
      if (flag) {
        path = path + '&filename=' + encodeURIComponent(inputval);
        flag = true;
      } else {
        path = path + '?filename=' + encodeURIComponent(inputval);
        flag = true;
      }
    }

    if (flag) {
      path = path + '&limit=20';
    } else {
      path = path + '?limit=20';
    }
    return path;
};

/**
 * 滚动条查询方法
 */
good.drive.search.AdvancedMenu.prototype.nextpage = function() {
  var that = this;
  var path = that.getPath();
  path = path + '&cursor=' +
       good.drive.search.AdvancedMenu.NEXTPAGETOKEN;
  var grid = good.drive.view.baseview.View.isGrid ?
      good.drive.search.AdvancedMenu.SEARCHGRID :
        good.drive.search.AdvancedMenu.SEARCHLIST;
  //连接服务器查询
  var rpc = new good.net.CrossDomainRpc('GET',
      good.constants.NAME,
      good.constants.VERSION, path,
      good.constants.SERVERADRESS);
  rpc.send(function(json) {
    //填充网格数据
    if (json && !json['error']) {
      if (json['nextPageToken'] != undefined) {
        good.drive.search.AdvancedMenu.NEXTPAGETOKEN = json['nextPageToken'];
      }
      if (json['items'] != undefined) {
        goog.array.forEach(json['items'], function(item) {
          if (item['thumbnail'] != undefined) {
            if (good.constants.DRIVE_SERVER.indexOf('.goodow.com') == -1) {
              var uri_server = new goog.Uri(good.constants.DRIVE_SERVER);
              var uri = new goog.Uri(item['thumbnail']);
              uri.setDomain(uri_server.getDomain());
              uri.setScheme(uri_server.getScheme());
              uri.setScheme(uri_server.getScheme());
              uri.setPort(uri_server.getPort());
              item['thumbnail'] = uri.toString();
            } else {
              item['thumbnail'] = item['thumbnail'];
            }
          }
          var cell = grid.createCell(item);
          cell.getLabelData = function(data) {
            return data.filename;
          };
          grid.add(cell);
          cell.renderCell();
        });
      } else {
        good.drive.search.AdvancedMenu.NEXTPAGETOKEN = undefined;
        grid.isEnd = true;
      }
      good.drive.view.baseview.View.visiable(grid);
    }
  });
};

/**
 * 绑定查询按钮Action
 */
good.drive.search.AdvancedMenu.prototype.searchbtncick = function() {
  var that = this;
  goog.events.listen(that._search_btn,
      goog.events.EventType.CLICK, function(e) {
    that.search('click');
  });
};
