package main

import (
	"os"
	"os/exec"
	"syscall"

	"golang.org/x/sys/windows/registry"
)

func hideWindow(c *exec.Cmd) {
	c.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: 0x08000000}
}

func autostart(on bool) {
	k, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.SET_VALUE)
	if err != nil {
		return
	}
	defer k.Close()
	if on {
		exe, _ := os.Executable()
		k.SetStringValue("1EYE Carbon Engine", `"`+exe+`"`)
	} else {
		k.DeleteValue("1EYE Carbon Engine")
	}
}
