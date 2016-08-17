--
-- Create a watcher that runs a function based on changes to
-- battery state.
--
local PreviousPowerSource = hs.battery.powerSource()
hs.battery.watcher.new(function()
  CurrentPowerSource = hs.battery.powerSource()
  if CurrentPowerSource ~= PreviousPowerSource then
    if CurrentPowerSource == "Battery Power" then
      -- do some cleanup when the battery is unplugged
      shutdownTimeMachine()
    end
    PreviousPowerSource = CurrentPowerSource
  end
end):start()

function shutdownTimeMachine()
  hs.alert.show("Stopping Time Machine")
  hs.execute("tmutil stopbackup")
  hs.execute("diskutil unmount '/Volumes/Backup_joec'")
end
