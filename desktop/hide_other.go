//go:build !windows

package main

import (
	"os/exec"
	"runtime"
)

func hideWindow(c *exec.Cmd) {}

func opener() string {
	if runtime.GOOS == "darwin" {
		return "open"
	}
	return "xdg-open"
}

func openURL(u string)  { exec.Command(opener(), u).Start() }
func openPath(p string) { exec.Command(opener(), p).Start() }
