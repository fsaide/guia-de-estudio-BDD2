package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
)

//go:embed all:../../../templates
var templatesFS embed.FS

//go:embed all:../../../static
var staticFS embed.FS

func main() {
	// Sirve los archivos de plantillas
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if path == "/" {
			path = "/index.html"
		}
		serveFileFromFS(w, r, templatesFS, "all:../../../templates", path)
	})

	// Sirve los archivos estáticos
	staticContent, err := fs.Sub(staticFS, "all:../../../static")
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticContent))))

	// Inicia el adaptador de Lambda
	lambda.Start(httpadapter.New(http.DefaultServeMux).ProxyWithContext)
}

func serveFileFromFS(w http.ResponseWriter, r *http.Request, fsys fs.FS, prefix, filePath string) {
	file, err := fsys.Open(prefix + filePath)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	http.ServeContent(w, r, stat.Name(), stat.ModTime(), file.(fs.ReadSeeker))
}