local hyper = {"ctrl", "alt", "cmd"}


function hello()
    hs.alert.show("Hello World!")
end

function full()
    local win = hs.window.focusedWindow()
    local f = win:frame()
    local screen = win:screen()
    local max = screen:frame()

    f.x = max.x
    f.y = max.y
    f.w = max.w
    f.h = max.h
    win:setFrame(f)
end

hs.hotkey.bind(hyper, "g", full)

-- lock the screen ala Windows NT
hs.hotkey.bind(hyper,"delete", function()
  hs.caffeinate.lockScreen()
  hs.alert.show("startScreensaver")
end)
