(function() {
  var path;

  path = require('path');

  describe("nvAtom", function() {
    var activationPromise, defaultDirectory, workspaceElement;
    defaultDirectory = atom.config.get('nvatom.directory');
    activationPromise = null;
    workspaceElement = null;
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      activationPromise = atom.packages.activatePackage('nvatom');
      return atom.config.set('nvatom.directory', 'testdata');
    });
    afterEach(function() {
      return atom.config.set('nvatom.directory', defaultDirectory);
    });
    return describe("when the nvatom:toggle event is triggered", function() {
      it("attaches and then detaches the view", function() {
        expect(workspaceElement.querySelector('.nvatom')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'nvatom:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(workspaceElement.querySelector('.nvatom')).toExist();
          return atom.commands.dispatch(workspaceElement, 'nvatom:toggle');
        });
      });
      return it("checks if we banned the default directory under packages directory", function() {
        atom.notifications.clear();
        waitsForPromise(function() {
          return atom.packages.activatePackage('notifications');
        });
        return runs(function() {
          var noteDirectoryUnderPackageDirectory;
          noteDirectoryUnderPackageDirectory = path.join(process.env.ATOM_HOME, 'packages', 'nvatom', 'notebook');
          atom.config.set('nvatom.directory', noteDirectoryUnderPackageDirectory);
          atom.commands.dispatch(workspaceElement, 'nvatom:toggle');
          waitsForPromise(function() {
            return activationPromise;
          });
          return runs(function() {
            var notification, notificationContainer;
            notificationContainer = workspaceElement.querySelector('atom-notifications');
            notification = notificationContainer.querySelector('atom-notification.fatal');
            return expect(notification).toExist();
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1ZvbHVtZXMvVXNlcnMvamNvdGVsbGVzZS8uYXRvbS9wYWNrYWdlcy9udmF0b20vc3BlYy9ub3RhdGlvbmFsLXZlbG9jaXR5LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFFBQUEscURBQUE7QUFBQSxJQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsQ0FBbkIsQ0FBQTtBQUFBLElBQ0EsaUJBQUEsR0FBb0IsSUFEcEIsQ0FBQTtBQUFBLElBRUEsZ0JBQUEsR0FBbUIsSUFGbkIsQ0FBQTtBQUFBLElBSUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFuQixDQUFBO0FBQUEsTUFDQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsUUFBOUIsQ0FEcEIsQ0FBQTthQUVBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsRUFBb0MsVUFBcEMsRUFIUztJQUFBLENBQVgsQ0FKQSxDQUFBO0FBQUEsSUFTQSxTQUFBLENBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixFQUFvQyxnQkFBcEMsRUFEUTtJQUFBLENBQVYsQ0FUQSxDQUFBO1dBWUEsUUFBQSxDQUFTLDJDQUFULEVBQXNELFNBQUEsR0FBQTtBQUNwRCxNQUFBLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsUUFBQSxNQUFBLENBQU8sZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsU0FBL0IsQ0FBUCxDQUFpRCxDQUFDLEdBQUcsQ0FBQyxPQUF0RCxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBR0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5QyxlQUF6QyxDQUhBLENBQUE7QUFBQSxRQUtBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FMQSxDQUFBO2VBUUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLFNBQS9CLENBQVAsQ0FBaUQsQ0FBQyxPQUFsRCxDQUFBLENBQUEsQ0FBQTtpQkFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLGVBQXpDLEVBRkc7UUFBQSxDQUFMLEVBVHdDO01BQUEsQ0FBMUMsQ0FBQSxDQUFBO2FBYUEsRUFBQSxDQUFHLG9FQUFILEVBQXlFLFNBQUEsR0FBQTtBQUN2RSxRQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBbkIsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixlQUE5QixFQURjO1FBQUEsQ0FBaEIsQ0FGQSxDQUFBO2VBS0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGNBQUEsa0NBQUE7QUFBQSxVQUFBLGtDQUFBLEdBQXFDLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUF0QixFQUFpQyxVQUFqQyxFQUE2QyxRQUE3QyxFQUF1RCxVQUF2RCxDQUFyQyxDQUFBO0FBQUEsVUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLEVBQW9DLGtDQUFwQyxDQURBLENBQUE7QUFBQSxVQUlBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsZUFBekMsQ0FKQSxDQUFBO0FBQUEsVUFNQSxlQUFBLENBQWdCLFNBQUEsR0FBQTttQkFDZCxrQkFEYztVQUFBLENBQWhCLENBTkEsQ0FBQTtpQkFTQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsZ0JBQUEsbUNBQUE7QUFBQSxZQUFBLHFCQUFBLEdBQXdCLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLG9CQUEvQixDQUF4QixDQUFBO0FBQUEsWUFDQSxZQUFBLEdBQWUscUJBQXFCLENBQUMsYUFBdEIsQ0FBb0MseUJBQXBDLENBRGYsQ0FBQTttQkFFQSxNQUFBLENBQU8sWUFBUCxDQUFvQixDQUFDLE9BQXJCLENBQUEsRUFIRztVQUFBLENBQUwsRUFWRztRQUFBLENBQUwsRUFOdUU7TUFBQSxDQUF6RSxFQWRvRDtJQUFBLENBQXRELEVBYmlCO0VBQUEsQ0FBbkIsQ0FGQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Volumes/Users/jcotellese/.atom/packages/nvatom/spec/notational-velocity-spec.coffee
