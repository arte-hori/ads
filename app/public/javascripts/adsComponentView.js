var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CreateDCaseView = (function () {
    function CreateDCaseView() {
        $("#dcase-create").click(function () {
            var name = $("#inputDCaseName").attr("value");
            var desc = $("#inputDesc").attr("value");
            var error = false;
            if(name == "") {
                $("#newdcase-name").addClass("error");
                error = true;
            } else {
                $("#newdcase-name").removeClass("error");
            }
            if(desc == "") {
                $("#newdcase-desc").addClass("error");
                error = true;
            }
            if(error) {
                return;
            }
            var id = 1;
            var tree = {
                NodeList: [
                    {
                        ThisNodeId: id,
                        NodeType: "Goal",
                        Description: desc,
                        Children: []
                    }
                ],
                TopGoalId: id,
                NodeCount: 1
            };
            var r = DCaseAPI.createDCase(name, tree);
            location.href = "./dcase/" + r.dcaseId;
        });
    }
    CreateDCaseView.prototype.enableSubmit = function () {
        $("#dcase-create").removeClass("disabled");
        $("#inputDCaseName").removeAttr("disabled");
        $("#inputDesc").removeAttr("disabled");
    };
    CreateDCaseView.prototype.disableSubmit = function () {
        $("#dcase-create").addClass("disabled");
        $("#inputDCaseName").attr("disabled", "");
        $("#inputDesc").attr("disabled", "");
    };
    return CreateDCaseView;
})();
var SelectDCaseContent = (function () {
    function SelectDCaseContent(id, name, user, lastDate, lastUser, isLogin) {
        this.id = id;
        this.name = name;
        this.user = user;
        this.lastDate = lastDate;
        this.lastUser = lastUser;
        this.isLogin = isLogin;
    }
    SelectDCaseContent.prototype.toHtml = function () {
        return $('');
    };
    SelectDCaseContent.prototype.setEvent = function () {
        var _this = this;
        if(this.isLogin) {
            $("a#e" + this.id).click(function (e) {
                var msg = prompt("dcase名を入力して下さい");
                if(msg != null) {
                    if(DCaseAPI.editDCase(_this.id, msg) != null) {
                        alert("変更しました");
                        location.reload();
                    }
                }
            });
            $("a#d" + this.id).click(function (e) {
                if(window.confirm('dcaseを削除しますか?')) {
                    if(DCaseAPI.deleteDCase(_this.id) != null) {
                        alert("削除しました");
                        location.reload();
                    }
                }
            });
        }
    };
    return SelectDCaseContent;
})();
var TableElement = (function (_super) {
    __extends(TableElement, _super);
    function TableElement(id, name, user, lastDate, lastUser, isLogin) {
        _super.call(this, id, name, user, lastDate, lastUser, isLogin);
        this.id = id;
        this.name = name;
        this.user = user;
        this.lastDate = lastDate;
        this.lastUser = lastUser;
        this.isLogin = isLogin;
    }
    TableElement.prototype.toHtml = function () {
        var html = '<td><a href="' + Config.BASEPATH + '/dcase/' + this.id + '">' + this.name + "</a></td><td>" + this.user + "</td><td>" + this.lastDate + "</td><td>" + this.lastUser + "</td>";
        if(this.isLogin) {
            html += "<td><a id=\"e" + this.id + "\" href=\"#\">Edit</a></td>" + "<td><a id=\"d" + this.id + "\" href=\"#\">Delete</a></td>";
        }
        return $("<tr></tr>").html(html);
    };
    return TableElement;
})(SelectDCaseContent);
var SelectDCaseManager = (function () {
    function SelectDCaseManager() {
        this.contents = [];
    }
    SelectDCaseManager.prototype.clear = function () {
    };
    SelectDCaseManager.prototype.updateContentsOrZeroView = function () {
    };
    SelectDCaseManager.prototype.add = function (s) {
        this.contents.push(s);
    };
    SelectDCaseManager.prototype._updateContentsOrZeroView = function ($tbody, zeroStr) {
        if(this.contents.length == 0) {
            $(zeroStr).appendTo($tbody);
        }
        $.each(this.contents, function (i, s) {
            s.toHtml().appendTo($tbody);
            s.setEvent();
        });
    };
    return SelectDCaseManager;
})();
var SelectDCaseTableManager = (function (_super) {
    __extends(SelectDCaseTableManager, _super);
    function SelectDCaseTableManager() {
        _super.call(this);
    }
    SelectDCaseTableManager.prototype.clear = function () {
        $("tbody#dcase-select-table *").remove();
    };
    SelectDCaseTableManager.prototype.updateContentsOrZeroView = function () {
        _super.prototype._updateContentsOrZeroView.call(this, $('#dcase-select-table'), "<tr><td><font color=gray>DCaseがありません</font></td><td></td><td></td><td></td></tr>");
    };
    return SelectDCaseTableManager;
})(SelectDCaseManager);
var SelectDCaseView = (function () {
    function SelectDCaseView() {
        this.pageIndex = 1;
        this.maxPageSize = 2;
        this.manager = new SelectDCaseTableManager();
    }
    SelectDCaseView.prototype.clear = function () {
        this.manager.clear();
    };
    SelectDCaseView.prototype.addElements = function (userId, pageIndex) {
        var _this = this;
        if(pageIndex == null || pageIndex < 1) {
            pageIndex = 1;
        }
        this.pageIndex = pageIndex - 0;
        var searchResults = DCaseAPI.searchDCase(this.pageIndex);
        var dcaseList = searchResults.dcaseList;
        this.maxPageSize = searchResults.summary.maxPage;
        var isLogin = userId != null;
        $.each(dcaseList, function (i, dcase) {
            var s = new TableElement(dcase.dcaseId, dcase.dcaseName, dcase.userName, dcase.latestCommit.dateTime, dcase.latestCommit.userName, isLogin);
            _this.manager.add(s);
        });
        this.manager.updateContentsOrZeroView();
    };
    SelectDCaseView.prototype.initEvents = function () {
        var _this = this;
        $("#prev-page").click(function (e) {
            var i = _this.pageIndex - 0;
            if(i > 1) {
                _this.pageIndex = i - 1;
                location.href = "/page/" + _this.pageIndex;
            }
            e.preventDefault();
        });
        $("#next-page").click(function (e) {
            var i = _this.pageIndex - 0;
            if(_this.maxPageSize >= i + 1) {
                _this.pageIndex = i + 1;
                location.href = "/page/" + _this.pageIndex;
            }
            e.preventDefault();
        });
    };
    return SelectDCaseView;
})();
var SearchView = (function () {
    function SearchView(viewer) {
        this.viewer = viewer;
        var _this = this;
        var searchQuery = $('#search-query');
        searchQuery.popover({
            html: true,
            placement: 'bottom',
            trigger: 'manual',
            content: function () {
                var wrapper = $('<div id="search_result_wrapper">');
                $('<a class="btn btn-link">close</a>').click(function () {
                    searchQuery.popover('hide');
                    return false;
                }).appendTo(wrapper);
                wrapper.append('<ul id="search_result_ul" class="unstyled">');
                wrapper.width(searchQuery.width());
                return wrapper;
            }
        });
        $('#search-form').submit(function () {
            var query = searchQuery.val();
            if(query.length > 0) {
                _this.updateSearchResult(query);
            }
            return false;
        });
    }
    SearchView.prototype.searchNode = function (text, types, beginDate, endDate, callback, callbackOnNoResult) {
        var dcase = this.viewer.getDCase();
        var root = dcase ? dcase.getTopGoal() : undefined;
        if(!root) {
            if(callbackOnNoResult) {
                callbackOnNoResult();
            }
            return;
        }
        root.traverse(function (index, node) {
            var name = node.name;
            var desc = node.desc;
            var d_index = desc.toLowerCase().indexOf(text);
            var n_index = name.toLowerCase().indexOf(text);
            if(d_index != -1 || n_index != -1) {
                callback(node);
            }
        });
    };
    SearchView.prototype.updateSearchResult = function (text) {
        var _this = this;
        $('#search-query').popover('show');
        var $res = $("#search_result_ul");
        $res.empty();
        text = text.toLowerCase();
        var result = DCaseAPI.searchDCase(text);
        if(result.length == 0) {
            $res.append("<li>No Results</li>");
        } else {
            for(var i = 0; i < result.length; ++i) {
                var res = result[i];
                var id = res.dcaseId;
                $("<li>").html("<a href=\"dcase/" + id + "\">" + id + "</a>").appendTo($res);
            }
        }
        $res.append("<hr>");
        this.searchNode(text, [], null, null, function (node) {
            $("<li>").html("<a href=\"#\">" + node.name + "</a>").click(function (e) {
                _this.viewer.centerize(node, 500);
                e.preventDefault();
            }).appendTo($res);
        }, function () {
        });
    };
    return SearchView;
})();
