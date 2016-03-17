--
-- Create a watcher that runs a function based on changes to
-- battery state.
--
local PreviousPowerSource = hs.battery.powerSource()
hs.battery.watcher.new(function()
  CurrentPowerSource = hs.battery.powerSource()
  if CurrentPowerSource ~= PreviousPowerSource then
    if CurrentPowerSource == "Battery Power" then
      hs.alert.show("Ejecting Disks")
      hs.execute("diskutil unmount '/Volumes/Backup_joec'")
    end
    PreviousPowerSource = CurrentPowerSource
  end
end):start()
