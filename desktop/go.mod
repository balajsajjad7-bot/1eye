module oneeye

go 1.24.7

require github.com/skip2/go-qrcode v0.0.0-20200617195104-da1b6568686e

require (
	golang.org/x/crypto v0.31.0 // indirect
	golang.org/x/sys v0.28.0 // indirect
)

replace golang.org/x/crypto => github.com/golang/crypto v0.31.0

replace golang.org/x/sys => github.com/golang/sys v0.28.0
