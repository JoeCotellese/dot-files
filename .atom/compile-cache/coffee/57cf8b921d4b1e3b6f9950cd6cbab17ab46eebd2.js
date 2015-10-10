(function() {
  var $, $$, DocQuery, NotationalVelocityView, SelectListView, fs, path, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  fs = require('fs-plus');

  _ = require('underscore-plus');

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$ = _ref.$$, SelectListView = _ref.SelectListView;

  DocQuery = require('docquery');

  module.exports = NotationalVelocityView = (function(_super) {
    __extends(NotationalVelocityView, _super);

    function NotationalVelocityView() {
      return NotationalVelocityView.__super__.constructor.apply(this, arguments);
    }

    NotationalVelocityView.prototype.initialize = function(state) {
      this.initializedAt = new Date();
      NotationalVelocityView.__super__.initialize.apply(this, arguments);
      this.addClass('nvatom from-top overlay');
      this.rootDirectory = fs.normalize(atom.config.get('nvatom.directory'));
      if (!fs.existsSync(this.rootDirectory)) {
        throw new Error("The given directory " + this.rootDirectory + " does not exist. ", +"Set the note directory to the existing one from Settings.");
      }
      this.skipPopulateList = false;
      this.prevCursorPosition = 0;
      this.documentsLoaded = false;
      this.docQuery = new DocQuery(this.rootDirectory, {
        recursive: true,
        extensions: atom.config.get('nvatom.extensions')
      });
      this.docQuery.on("ready", (function(_this) {
        return function() {
          _this.documentsLoaded = true;
          _this.setLoading();
          return _this.populateList();
        };
      })(this));
      this.docQuery.on("added", (function(_this) {
        return function(fileDetails) {
          if (_this.documentsLoaded) {
            return _this.populateList();
          }
        };
      })(this));
      this.docQuery.on("updated", (function(_this) {
        return function(fileDetails) {
          if (_this.documentsLoaded) {
            return _this.populateList();
          }
        };
      })(this));
      this.docQuery.on("removed", (function(_this) {
        return function(fileDetails) {
          if (_this.documentsLoaded) {
            return _this.populateList();
          }
        };
      })(this));
      if (!atom.config.get('nvatom.enableLunrPipeline')) {
        return this.docQuery.searchIndex.pipeline.reset();
      }
    };

    NotationalVelocityView.prototype.isCursorProceeded = function() {
      var currCursorPosition, editor, isCursorProceeded;
      editor = this.filterEditorView.model;
      currCursorPosition = editor.getCursorBufferPosition().column;
      isCursorProceeded = this.prevCursorPosition < currCursorPosition;
      this.prevCursorPosition = currCursorPosition;
      return isCursorProceeded;
    };

    NotationalVelocityView.prototype.selectItem = function(filteredItems, filterQuery) {
      var editor, isCursorProceeded, item, n, _i, _j, _len, _len1, _results;
      isCursorProceeded = this.isCursorProceeded();
      for (_i = 0, _len = filteredItems.length; _i < _len; _i++) {
        item = filteredItems[_i];
        if (item.title.toLowerCase() === filterQuery.toLowerCase()) {
          n = filteredItems.indexOf(item) + 1;
          this.selectItemView(this.list.find("li:nth-child(" + n + ")"));
          return;
        }
      }
      _results = [];
      for (_j = 0, _len1 = filteredItems.length; _j < _len1; _j++) {
        item = filteredItems[_j];
        if (item.title.toLowerCase().startsWith(filterQuery.toLowerCase()) && isCursorProceeded) {
          this.skipPopulateList = true;
          editor = this.filterEditorView.model;
          editor.setText(filterQuery + item.title.slice(filterQuery.length));
          editor.selectLeft(item.title.length - filterQuery.length);
          n = filteredItems.indexOf(item) + 1;
          _results.push(this.selectItemView(this.list.find("li:nth-child(" + n + ")")));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    NotationalVelocityView.prototype.filter = function(filterQuery) {
      if ((filterQuery === "") || (filterQuery === void 0)) {
        return this.docQuery.documents;
      }
      return this.docQuery.search(filterQuery);
    };

    NotationalVelocityView.prototype.getFilterKey = function() {
      return 'filetext';
    };

    NotationalVelocityView.prototype.toggle = function() {
      var _ref1;
      if ((_ref1 = this.panel) != null ? _ref1.isVisible() : void 0) {
        return this.hide();
      } else if (this.documentsLoaded) {
        this.populateList();
        return this.show();
      } else {
        this.setLoading("Loading documents");
        return this.show();
      }
    };

    NotationalVelocityView.prototype.viewForItem = function(item) {
      var content;
      content = item.body.slice(0, 100);
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div({
              "class": 'primary-line'
            }, function() {
              _this.span("" + item.title);
              return _this.div({
                "class": 'metadata'
              }, "" + (item.modifiedAt.toLocaleDateString()));
            });
            return _this.div({
              "class": 'secondary-line'
            }, "" + content);
          };
        })(this));
      });
    };

    NotationalVelocityView.prototype.confirmSelection = function() {
      var calculatedPath, extension, filePath, item, sanitizedQuery;
      item = this.getSelectedItem();
      filePath = null;
      sanitizedQuery = this.getFilterQuery().replace(/\s+$/, '');
      extension = atom.config.get('nvatom.extensions').length ? atom.config.get('nvatom.extensions')[0] : '.md';
      calculatedPath = path.join(this.rootDirectory, sanitizedQuery + extension);
      if (item != null) {
        filePath = item.filePath;
      } else if (fs.existsSync(calculatedPath)) {
        filePath = calculatedPath;
      } else if (sanitizedQuery.length > 0) {
        filePath = calculatedPath;
        fs.writeFileSync(filePath, '');
      }
      if (filePath) {
        atom.workspace.open(filePath).then(function(editor) {
          var debouncedSave, save;
          save = function() {
            atom.packages.deactivatePackage('whitespace');
            editor.save();
            return atom.packages.activatePackage('whitespace');
          };
          debouncedSave = _.debounce(save, 1000);
          return editor.onDidStopChanging(function() {
            if (editor.isModified()) {
              return debouncedSave();
            }
          });
        });
      }
      return this.cancel();
    };

    NotationalVelocityView.prototype.destroy = function() {
      var _ref1;
      this.cancel();
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    NotationalVelocityView.prototype.show = function() {
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.focusFilterEditor();
    };

    NotationalVelocityView.prototype.cancelled = function() {
      return this.hide();
    };

    NotationalVelocityView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    NotationalVelocityView.prototype.getFilterQuery = function() {
      var editor, fullText, selectedText;
      editor = this.filterEditorView.model;
      fullText = editor.getText();
      selectedText = editor.getSelectedText();
      return fullText.substring(0, fullText.length - selectedText.length);
    };

    NotationalVelocityView.prototype.populateList = function() {
      var filterQuery, filteredItems, i, item, itemView, _i, _ref1;
      filterQuery = this.getFilterQuery();
      filteredItems = this.filter(filterQuery);
      this.list.empty();
      if (filteredItems.length) {
        this.setError(null);
        for (i = _i = 0, _ref1 = Math.min(filteredItems.length, this.maxItems); 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          item = filteredItems[i];
          itemView = $(this.viewForItem(item));
          itemView.data('select-list-item', item);
          this.list.append(itemView);
        }
        return this.selectItem(filteredItems, filterQuery);
      } else {
        return this.setError(this.getEmptyMessage(this.docQuery.documents.length, filteredItems.length));
      }
    };

    NotationalVelocityView.prototype.schedulePopulateList = function() {
      if (!this.skipPopulateList) {
        NotationalVelocityView.__super__.schedulePopulateList.apply(this, arguments);
      }
      return this.skipPopulateList = false;
    };

    return NotationalVelocityView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1ZvbHVtZXMvVXNlcnMvamNvdGVsbGVzZS8uYXRvbS9wYWNrYWdlcy9udmF0b20vbGliL25vdGF0aW9uYWwtdmVsb2NpdHktdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMEVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFHQSxPQUEwQixPQUFBLENBQVEsc0JBQVIsQ0FBMUIsRUFBQyxTQUFBLENBQUQsRUFBSSxVQUFBLEVBQUosRUFBUSxzQkFBQSxjQUhSLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FKWCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDZDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxxQ0FBQSxVQUFBLEdBQVksU0FBQyxLQUFELEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsSUFBQSxDQUFBLENBQXJCLENBQUE7QUFBQSxNQUNBLHdEQUFBLFNBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLHlCQUFWLENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLENBQWIsQ0FIakIsQ0FBQTtBQUlBLE1BQUEsSUFBQSxDQUFBLEVBQVMsQ0FBQyxVQUFILENBQWMsSUFBQyxDQUFBLGFBQWYsQ0FBUDtBQUNFLGNBQVUs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

//# sourceURL=/Volumes/Users/jcotellese/.atom/packages/nvatom/lib/notational-velocity-view.coffee
