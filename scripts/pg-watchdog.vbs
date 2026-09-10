' pg-watchdog.vbs —— PG 守卫：由计划任务 PingcePgKeeper-* 每分钟触发，
' 隐藏窗口执行 node pg-keeper.mjs ensure，实现 PG 崩溃后自动拉起。
' 输出追加到 logs\pg-watchdog.log（超过 1MB 自动轮转），用于审计崩溃/恢复时间线。
Option Explicit
Dim shell, fso, logFile, f
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
logFile = "F:\pingce\logs\pg-watchdog.log"
On Error Resume Next
If fso.FileExists(logFile) Then
  If fso.GetFile(logFile).Size > 1048576 Then fso.DeleteFile logFile, True ' 超过 1MB 轮转
End If
Set f = fso.OpenTextFile(logFile, 8, True) ' 8 = ForAppending
f.WriteLine "[" & Now & "] watchdog run"
f.Close
On Error Goto 0
shell.Run "cmd /c ""C:\Program Files\nodejs\node.exe"" F:\pingce\pg-keeper.mjs ensure >> " & logFile & " 2>&1", 0, False
