package main

import (
	"fmt"
	"log"
	"net/http"
)

func handlerIndex(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/index.html")
}

func handlerQuiz(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/quiz.html")
}

func handlerSummary(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/summary.html")
}

func handlerModule1(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/module1.html")
}

func handlerModule2(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/module2.html")
}

func handlerModule3(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/module3.html")
}

func handlerModule4(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/module4.html")
}

func handlerModule5(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/module5.html")
}

func handlerModule6(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/module6.html")
}

func handlerPractice1(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/practice1.html")
}

func handlerPractice2(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/practice2.html")
}

func handlerPractice3(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/practice3.html")
}

func handlerPractice4(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/practice4.html")
}

func handlerPractice5(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/practice5.html")
}

func handlerPractice6(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/practice6.html")
}

func main() {
	port := ":8080"

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/", handlerIndex)
	http.HandleFunc("/quiz", handlerQuiz)
	http.HandleFunc("/summary", handlerSummary)
	http.HandleFunc("/module1", handlerModule1)     // Módulo 1
	http.HandleFunc("/module2", handlerModule2)     // Módulo 2
	http.HandleFunc("/module3", handlerModule3)     // Módulo 3
	http.HandleFunc("/module4", handlerModule4)     // Módulo 4
	http.HandleFunc("/module5", handlerModule5)     // Módulo 5
	http.HandleFunc("/module6", handlerModule6)     // Módulo 6
	http.HandleFunc("/practice1", handlerPractice1) // Módulo 1
	http.HandleFunc("/practice2", handlerPractice2) // Módulo 2
	http.HandleFunc("/practice3", handlerPractice3) // Módulo 3
	http.HandleFunc("/practice4", handlerPractice4) // Módulo 4
	http.HandleFunc("/practice5", handlerPractice5) // Módulo 5
	http.HandleFunc("/practice6", handlerPractice6) // Módulo 6

	fmt.Printf("Servidor iniciado. Haz clic aquí para abrir: http://localhost%s\n", port)

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Error al iniciar el servidor: ", err)
	}
}
