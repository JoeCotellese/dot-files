---
--- Do things in Omnifocus
---

function of_startofday()
  hs.application.launchOrFocus("OmniFocus")
  local of = hs.appfinder.appFromName("OmniFocus")

  local new_window = {"File", "New Window"}
  local close_window = {"File", "Close"}
  local inbox = {"Perspectives", "Inbox"}
  local projects = {"Perspectives", "Projects"}

  -- Set the initial menu to the Inbox
  of:selectMenuItem(close_window)
  of:selectMenuItem(inbox)
  local win = hs.window.frontmostWindow()
  hs.grid.set(win, grid.leftHalf, hs.screen.mainScreen())

  -- Set the second window to the projects file
  of:selectMenuItem(new_window)
  of:selectMenuItem(projects)
  local win = hs.window.frontmostWindow()
  hs.grid.set(win, grid.rightHalf, hs.screen.mainScreen())

end

--hs.urlevent.bind("ofStartOfDay", of_startofday())
hs.hotkey.bind({"cmd", "alt", "ctrl"}, '7', of_startofday)
