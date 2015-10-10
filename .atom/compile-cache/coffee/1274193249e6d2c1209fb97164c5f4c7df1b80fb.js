(function() {
  var $;

  $ = require('jquery');

  module.exports = {
    config: {
      fullscreen: {
        type: 'boolean',
        "default": true,
        order: 1
      },
      softWrap: {
        description: 'Enables / Disables soft wrapping when Zen is active.',
        type: 'boolean',
        "default": atom.config.get('editor.softWrap'),
        order: 2
      },
      gutter: {
        description: 'Shows / Hides the gutter when Zen is active.',
        type: 'boolean',
        "default": false,
        order: 3
      },
      typewriter: {
        description: 'Keeps the cursor vertically centered where possible.',
        type: 'boolean',
        "default": false,
        order: 4
      },
      minimap: {
        description: 'Enables / Disables the minimap plugin when Zen is active.',
        type: 'boolean',
        "default": false,
        order: 5
      },
      width: {
        type: 'integer',
        "default": atom.config.get('editor.preferredLineLength'),
        order: 6
      },
      tabs: {
        description: 'Determines the tab style used while Zen is active.',
        type: 'string',
        "default": 'hidden',
        "enum": ['hidden', 'single', 'multiple'],
        order: 7
      },
      showWordCount: {
        description: 'Show the word-count if you have the package installed.',
        type: 'string',
        "default": 'Hidden',
        "enum": ['Hidden', 'Left', 'Right'],
        order: 8
      }
    },
    activate: function(state) {
      return atom.commands.add('atom-workspace', 'zen:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    },
    toggle: function() {
      var body, editor, fullscreen, minimap, softWrap, typewriter, width, _ref, _ref1, _ref2;
      body = document.querySelector('body');
      editor = atom.workspace.getActiveTextEditor();
      fullscreen = atom.config.get('Zen.fullscreen');
      width = atom.config.get('Zen.width');
      softWrap = atom.config.get('Zen.softWrap');
      typewriter = atom.config.get('Zen.typewriter');
      minimap = atom.config.get('Zen.minimap');
      if (body.getAttribute('data-zen') !== 'true') {
        if (editor === void 0) {
          atom.notifications.addInfo('Zen cannot be achieved in this view.');
          return;
        }
        if (atom.config.get('Zen.tabs')) {
          body.setAttribute('data-zen-tabs', atom.config.get('Zen.tabs'));
        }
        switch (atom.config.get('Zen.showWordCount')) {
          case 'Left':
            body.setAttribute('data-zen-word-count', 'visible');
            body.setAttribute('data-zen-word-count-position', 'left');
            break;
          case 'Right':
            body.setAttribute('data-zen-word-count', 'visible');
            body.setAttribute('data-zen-word-count-position', 'right');
            break;
          case 'Hidden':
            body.setAttribute('data-zen-word-count', 'hidden');
        }
        body.setAttribute('data-zen-gutter', atom.config.get('Zen.gutter'));
        body.setAttribute('data-zen', 'true');
        if (editor.isSoftWrapped() !== softWrap) {
          editor.setSoftWrapped(softWrap);
          this.unSoftWrap = true;
        }
        requestAnimationFrame(function() {
          return $('atom-text-editor:not(.mini)').css('width', editor.getDefaultCharWidth() * width);
        });
        this.fontChanged = atom.config.onDidChange('editor.fontSize', function() {
          return requestAnimationFrame(function() {
            return $('atom-text-editor:not(.mini)').css('width', editor.getDefaultCharWidth() * width);
          });
        });
        this.paneChanged = atom.workspace.onDidChangeActivePaneItem(function() {
          return requestAnimationFrame(function() {
            return $('atom-text-editor:not(.mini)').css('width', editor.getDefaultCharWidth() * width);
          });
        });
        if (typewriter) {
          if (!atom.config.get('editor.scrollPastEnd')) {
            atom.config.set('editor.scrollPastEnd', true);
            this.scrollPastEndReset = true;
          } else {
            this.scrollPastEndReset = false;
          }
          this.lineChanged = editor.onDidChangeCursorPosition(function() {
            return requestAnimationFrame(function() {
              this.halfScreen = Math.floor(editor.getRowsPerPage() / 2);
              this.cursor = editor.getCursorScreenPosition();
              return editor.setScrollTop(editor.getLineHeightInPixels() * (this.cursor.row - this.halfScreen));
            });
          });
        }
        if ($('.tree-view').length) {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:toggle');
          this.restoreTree = true;
        }
        if ($('atom-text-editor /deep/ atom-text-editor-minimap').length && !minimap) {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'minimap:toggle');
          this.restoreMinimap = true;
        }
        if (fullscreen) {
          return atom.setFullScreen(true);
        }
      } else {
        body.setAttribute('data-zen', 'false');
        if (fullscreen) {
          atom.setFullScreen(false);
        }
        if (this.unSoftWrap && editor !== void 0) {
          editor.setSoftWrapped(atom.config.get('editor.softWrap'));
          this.unSoftWrap = null;
        }
        $('atom-text-editor:not(.mini)').css('width', '');
        $('.status-bar-right').css('overflow', 'hidden');
        requestAnimationFrame(function() {
          return $('.status-bar-right').css('overflow', '');
        });
        if (this.restoreTree) {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:show');
          this.restoreTree = false;
        }
        if (this.restoreMinimap && $('atom-text-editor /deep/ atom-text-editor-minimap').length !== 1) {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'minimap:toggle');
          this.restoreMinimap = false;
        }
        if ((_ref = this.fontChanged) != null) {
          _ref.dispose();
        }
        if ((_ref1 = this.paneChanged) != null) {
          _ref1.dispose();
        }
        if ((_ref2 = this.lineChanged) != null) {
          _ref2.dispose();
        }
        if (this.scrollPastEndReset) {
          return atom.config.set('editor.scrollPastEnd', false);
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1ZvbHVtZXMvVXNlcnMvamNvdGVsbGVzZS8uYXRvbS9wYWNrYWdlcy96ZW4vbGliL3plbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsQ0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUFKLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFVBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsUUFFQSxLQUFBLEVBQU8sQ0FGUDtPQURGO0FBQUEsTUFJQSxRQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSxzREFBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUJBQWhCLENBRlQ7QUFBQSxRQUdBLEtBQUEsRUFBTyxDQUhQO09BTEY7QUFBQSxNQVNBLE1BQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLDhDQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEtBRlQ7QUFBQSxRQUdBLEtBQUEsRUFBTyxDQUhQO09BVkY7QUFBQSxNQWNBLFVBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLHNEQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEtBRlQ7QUFBQSxRQUdBLEtBQUEsRUFBTyxDQUhQO09BZkY7QUFBQSxNQW1CQSxPQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSwyREFBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO0FB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

//# sourceURL=/Volumes/Users/jcotellese/.atom/packages/zen/lib/zen.coffee
