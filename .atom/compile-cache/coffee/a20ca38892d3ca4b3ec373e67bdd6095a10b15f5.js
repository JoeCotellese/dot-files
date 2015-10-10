(function() {
  var CompositeDisposable, Disposable, fs, path, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  fs = require('fs-plus');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  module.exports = {
    config: {
      directory: {
        title: 'Note Directory',
        description: 'The directory to archive notes',
        type: 'string',
        "default": path.join(process.env.ATOM_HOME, 'nvatom-notes')
      },
      extensions: {
        title: 'Extensions',
        description: 'The first extension will be used for newly created notes.',
        type: 'array',
        "default": ['.md', '.txt'],
        items: {
          type: 'string'
        }
      },
      enableLunrPipeline: {
        title: 'Enable Lunr Pipeline',
        description: 'Lunr pipeline preprocesses query to make search faster. However, it will skip searching some of stop words such as "an" or "be".',
        type: 'boolean',
        "default": true
      }
    },
    notationalVelocityView: null,
    activate: function(state) {
      var handleBeforeUnload, handleBlur;
      this.rootDirectory = this.ensureNoteDirectory();
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'nvatom:toggle': (function(_this) {
          return function() {
            return _this.createView(state).toggle();
          };
        })(this)
      }));
      handleBeforeUnload = this.autosaveAll.bind(this);
      window.addEventListener('beforeunload', handleBeforeUnload, true);
      this.subscriptions.add(new Disposable(function() {
        return window.removeEventListener('beforeunload', handleBeforeUnload, true);
      }));
      handleBlur = (function(_this) {
        return function(event) {
          if (event.target === window) {
            return _this.autosaveAll();
          } else if (event.target.matches('atom-text-editor:not([mini])') && !event.target.contains(event.relatedTarget)) {
            return _this.autosave(event.target.getModel());
          }
        };
      })(this);
      window.addEventListener('blur', handleBlur, true);
      this.subscriptions.add(new Disposable(function() {
        return window.removeEventListener('blur', handleBlur, true);
      }));
      return this.subscriptions.add(atom.workspace.onWillDestroyPaneItem((function(_this) {
        return function(_arg) {
          var item;
          item = _arg.item;
          if (!_this.autodelete(item)) {
            return _this.autosave(item);
          }
        };
      })(this)));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      return this.notationalVelocityView.destroy();
    },
    serialize: function() {
      return {
        notationalVelocityViewState: this.notationalVelocityView.serialize()
      };
    },
    createView: function(state, docQuery) {
      var NotationalVelocityView;
      if (this.notationalVelocityView == null) {
        NotationalVelocityView = require('./notational-velocity-view');
        this.notationalVelocityView = new NotationalVelocityView(state.notationalVelocityViewState);
      }
      return this.notationalVelocityView;
    },
    autosave: function(paneItem) {
      var uri, _ref1;
      if ((paneItem != null ? typeof paneItem.getURI === "function" ? paneItem.getURI() : void 0 : void 0) == null) {
        return;
      }
      if (!(paneItem != null ? typeof paneItem.isModified === "function" ? paneItem.isModified() : void 0 : void 0)) {
        return;
      }
      uri = paneItem.getURI();
      if (uri.indexOf(this.rootDirectory) !== 0) {
        return;
      }
      if (_ref1 = path.extname(uri), __indexOf.call(atom.config.get('nvatom.extensions'), _ref1) < 0) {
        return;
      }
      return paneItem != null ? typeof paneItem.save === "function" ? paneItem.save() : void 0 : void 0;
    },
    autodelete: function(paneItem) {
      var noteName, uri, _ref1;
      if ((paneItem != null ? typeof paneItem.getURI === "function" ? paneItem.getURI() : void 0 : void 0) == null) {
        return false;
      }
      uri = paneItem.getURI();
      if (uri.indexOf(this.rootDirectory) !== 0) {
        return false;
      }
      if (_ref1 = path.extname(uri), __indexOf.call(atom.config.get('nvatom.extensions'), _ref1) < 0) {
        return false;
      }
      if (!(paneItem != null ? paneItem.isEmpty() : void 0)) {
        return false;
      }
      fs.unlinkSync(uri);
      noteName = uri.substring(this.rootDirectory.length + 1);
      atom.notifications.addInfo("Empty note " + noteName + " is deleted.");
      return true;
    },
    autosaveAll: function() {
      var paneItem, _i, _len, _ref1, _results;
      _ref1 = atom.workspace.getPaneItems();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        paneItem = _ref1[_i];
        _results.push(this.autosave(paneItem));
      }
      return _results;
    },
    ensureNoteDirectory: function() {
      var defaultNoteDirectory, noteDirectory, packagesDirectory;
      noteDirectory = fs.normalize(atom.config.get('nvatom.directory'));
      packagesDirectory = path.join(process.env.ATOM_HOME, 'packages');
      defaultNoteDirectory = path.join(packagesDirectory, 'nvatom', 'notebook');
      if (noteDirectory.startsWith(packagesDirectory)) {
        throw new Error("Note directory " + noteDirectory + " cannot reside within atom packages directory. Please change its value from package settings.");
      }
      if (!fs.existsSync(noteDirectory)) {
        this.tryMigrateFromNotationalVelocity();
        noteDirectory = atom.config.get('nvatom.directory');
        if (!fs.existsSync(noteDirectory)) {
          fs.makeTreeSync(noteDirectory);
          fs.copySync(defaultNoteDirectory, noteDirectory);
        }
      }
      return fs.realpathSync(noteDirectory);
    },
    tryMigrateFromNotationalVelocity: function() {
      var currNoteDirectory, defaultNoteDirectory, packagesDirectory, prevNoteDirectory;
      prevNoteDirectory = atom.config.get('notational-velocity.directory');
      currNoteDirectory = atom.config.get('nvatom.directory');
      packagesDirectory = path.join(process.env.ATOM_HOME, 'packages');
      defaultNoteDirectory = path.join(packagesDirectory, 'nvatom', 'notebook');
      if (prevNoteDirectory === void 0) {
        return;
      }
      atom.notifications.addInfo('Migrating from notational-velocity package...');
      if (!fs.existsSync(prevNoteDirectory)) {
        atom.notifications.addError("notational-velocity.directory " + prevNoteDirectory + " does not exists. Migration process is failed.");
        return;
      }
      if (prevNoteDirectory.startsWith(packagesDirectory)) {
        fs.makeTreeSync(currNoteDirectory);
        fs.copySync(prevNoteDirectory, currNoteDirectory);
      } else {
        if (path.join(process.env.ATOM_HOME, 'nvatom-notes') === currNoteDirectory) {
          atom.config.set('nvatom.directory', prevNoteDirectory);
        }
      }
      return atom.notifications.addInfo('Finished migration.');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1ZvbHVtZXMvVXNlcnMvamNvdGVsbGVzZS8uYXRvbS9wYWNrYWdlcy9udmF0b20vbGliL25vdGF0aW9uYWwtdmVsb2NpdHkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLE9BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0Isa0JBQUEsVUFGdEIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sZ0JBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxnQ0FEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBdEIsRUFBaUMsY0FBakMsQ0FIVDtPQURGO0FBQUEsTUFLQSxVQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxZQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsMkRBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxPQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsQ0FBQyxLQUFELEVBQVEsTUFBUixDQUhUO0FBQUEsUUFJQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO1NBTEY7T0FORjtBQUFBLE1BWUEsa0JBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLHNCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsa0lBRGI7QUFBQSxR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

//# sourceURL=/Volumes/Users/jcotellese/.atom/packages/nvatom/lib/notational-velocity.coffee
