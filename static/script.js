document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DEL MODO OSCURO (Se ejecuta en todas las páginas) ---
    const themeToggle = document.getElementById('checkbox');
    
    // Función para aplicar el tema guardado
    const applyTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.checked = false;
        }
    };
    
    // Evento para cambiar el tema
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

    // Aplicar el tema al cargar la página
    applyTheme();

    // --- LÓGICA DEL CUESTIONARIO (Solo se ejecuta si estamos en la página del quiz) ---
    if (document.getElementById('quiz-form')) {
        
        const questionBank = {
            1: [ // Corresponds to module=1
                { q: "¿En qué orden lógico se procesan las cláusulas <code>WHERE</code>, <code>GROUP BY</code> y <code>HAVING</code>?", a: ["WHERE, HAVING, GROUP BY", "WHERE, GROUP BY, HAVING", "GROUP BY, WHERE, HAVING", "HAVING, WHERE, GROUP BY"], correct: 1 },
                { q: "Si quieres encontrar todos los nombres que terminan con 'an', ¿qué condición <code>LIKE</code> usarías?", a: ["LIKE 'an%'", "LIKE '_an'", "LIKE '%an'", "LIKE 'an_'"], correct: 2 },
                { q: "¿Qué tipo de <code>JOIN</code> incluirá todas las filas de la tabla izquierda, incluso si no tienen coincidencias en la tabla derecha?", a: ["INNER JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "LEFT JOIN"], correct: 3 },
                { q: "La función de agregación <code>AVG(columna)</code>, ¿qué hace con los valores <code>NULL</code> de la columna?", a: ["Los trata como si fueran 0", "Provoca un error en la consulta", "Los ignora completamente del cálculo", "Los promedia con los demás valores"], correct: 2 },
                { q: "¿Cuál es el propósito del operador <code>EXISTS</code> en una subconsulta?", a: ["Contar el número de filas que devuelve la subconsulta", "Verificar si la subconsulta devuelve al menos una fila", "Sumar los valores de una columna en la subconsulta", "Devolver el primer valor de la subconsulta"], correct: 1 }
            ],
            2: [ // Corresponds to module=2
                { q: "Si una clave foránea tiene la acción referencial <code>ON DELETE CASCADE</code>, ¿qué sucede si se borra el registro padre referenciado?", a: ["La operación de borrado es rechazada", "El valor de la clave foránea en los registros hijos se pone a NULL", "Todos los registros hijos que la referencian también son borrados", "El valor de la clave foránea se cambia a su valor por defecto"], correct: 2 },
                { q: "¿Cuál de estas afirmaciones sobre una <code>PRIMARY KEY</code> es CIERTA?", a: ["Puede contener valores NULL", "Puede haber múltiples claves primarias en una tabla", "Implica las restricciones UNIQUE y NOT NULL", "Es menos eficiente que una restricción UNIQUE"], correct: 2 },
                { q: "Una restricción de tipo <code>ASSERTION</code> en el estándar SQL se caracteriza por:", a: ["Aplicar solo a una columna específica", "Poder involucrar múltiples tablas para validar una regla de negocio global", "Ejecutarse solo cuando un usuario específico modifica datos", "Ser la restricción más eficiente y recomendada para usar"], correct: 1 },
                { q: "La cláusula <code>MATCH FULL</code> en una clave foránea compuesta significa que:", a: ["Todos los valores de la clave foránea deben ser NULL, o todos deben ser no nulos y existir en la tabla referenciada", "Al menos uno de los valores de la clave foránea debe coincidir", "Se ignoran los valores nulos para la validación", "Se permite cualquier combinación de valores nulos y no nulos"], correct: 0 }
            ],
            3: [ // Corresponds to module=3
                { q: "¿Cuál es la principal desventaja de una <b>Vista Materializada</b>?", a: ["No se puede usar en consultas complejas", "Los datos pueden quedar desactualizados y necesitan ser refrescados", "Ocupa menos espacio que una tabla normal", "Es más lenta para consultas que una vista normal"], correct: 1 },
                { q: "Para hacer que una vista no actualizable automáticamente en PostgreSQL pueda manejar operaciones DML, ¿qué se debe utilizar?", a: ["La cláusula <code>WITH CHECK OPTION</code>", "Un trigger de tipo <code>AFTER</code>", "Un trigger de tipo <code>INSTEAD OF</code>", "Una función almacenada especial llamada <code>UPDATE_VIEW</code>"], correct: 2 },
                { q: "Si ejecutas un <code>UPDATE</code> en una vista definida con <code>WITH CHECK OPTION</code>, ¿qué comprobará el SGBD?", a: ["Que el usuario tenga permisos de UPDATE", "Que la nueva fila modificada siga cumpliendo la condición del <code>WHERE</code> de la vista", "Que la tabla base tenga un índice en la columna actualizada", "Que no haya triggers en la tabla base"], correct: 1 },
                { q: "¿Cuál de las siguientes cláusulas <b>impediría</b> que una vista sea automáticamente actualizable en PostgreSQL?", a: ["WHERE", "ORDER BY", "GROUP BY", "LIMIT en una subconsulta"], correct: 2 }
            ],
            4: [ // Corresponds to module=4
                { q: "En un trigger <code>FOR EACH ROW</code>, ¿qué contiene la variable especial <code>OLD</code> durante una operación de <code>INSERT</code>?", a: ["Los datos de la fila que se está insertando", "Es <code>NULL</code> o no está definida", "Los datos de la última fila que fue borrada", "Un valor de error"], correct: 1 },
                { q: "La principal diferencia entre una <code>FUNCTION</code> y un <code>PROCEDURE</code> en SQL es que...", a: ["Las funciones no pueden recibir parámetros", "Los procedimientos se ejecutan automáticamente", "Las funciones siempre deben devolver un valor, mientras que los procedimientos no", "Los procedimientos no pueden modificar datos en las tablas"], correct: 2 },
                { q: "Si quieres que un trigger se ejecute para validar los datos justo antes de que se escriban en la tabla, ¿qué combinación usarías?", a: ["AFTER INSERT", "BEFORE INSERT", "INSTEAD OF INSERT", "AFTER UPDATE"], correct: 1 },
                { q: "En PostgreSQL, la lógica (la acción) de un trigger se define dentro de:", a: ["La misma declaración <code>CREATE TRIGGER</code>", "Un bloque anónimo en el trigger", "Una función especial que devuelve el tipo <code>trigger</code>", "Un archivo de script externo"], correct: 2 }
            ],
            5: [ // Corresponds to module=5
                { q: "El comando <code>EXPLAIN</code> en PostgreSQL se utiliza para...", a: ["Ejecutar una consulta y medir el tiempo exacto que tarda", "Mostrar el plan de ejecución que el optimizador ha elegido para una consulta", "Crear un índice automáticamente para una consulta lenta", "Explicar el significado de una función SQL"], correct: 1 },
                { q: "La optimización heurística se basa en aplicar reglas para mejorar una consulta. ¿Cuál es una de las reglas más importantes?", a: ["Realizar los <code>JOIN</code> antes que cualquier filtro <code>WHERE</code>", "Evitar el uso de índices para no confundir al optimizador", "Realizar las operaciones de filtrado (Selección) y reducción de columnas (Proyección) lo antes posible", "Siempre usar <code>UNION ALL</code> en lugar de <code>UNION</code>"], correct: 2 },
                { q: "Un índice de tipo <b>Hash</b> es más eficiente para qué tipo de operación?", a: ["Búsquedas de rango (ej: <code>precio BETWEEN 100 AND 200</code>)", "Búsquedas por igualdad exacta (ej: <code>id = 123</code>)", "Búsquedas de patrones con <code>LIKE</code>", "Ordenar resultados con <code>ORDER BY</code>"], correct: 1 },
                { q: "La optimización basada en costo depende fundamentalmente de:", a: ["La velocidad de la CPU del servidor", "Las estadísticas actualizadas sobre los datos de la base de datos", "La cantidad de memoria RAM disponible", "El número de usuarios conectados"], correct: 1 }
            ],
            6: [ // Corresponds to module=6
                { q: "¿Qué permite la cláusula <code>WITH GRANT OPTION</code> al conceder un permiso?", a: ["Que el permiso solo sea válido por un tiempo limitado", "Que el usuario que recibe el permiso pueda a su vez concedérselo a otros usuarios", "Que el permiso se aplique a todas las tablas de la base de datos", "Que se registre en un log cada vez que el permiso es usado"], correct: 1 },
                { q: "El modelo de seguridad donde los permisos se asignan a grupos (roles) y los usuarios se asignan a esos grupos se conoce como:", a: ["Control de Acceso Discrecional (DAC)", "Control de Acceso Obligatorio (MAC)", "Control de Acceso Basado en Roles (RBAC)", "Control de Acceso por Niveles (LAC)"], correct: 2 },
                { q: "¿Qué comando se utiliza para quitar un permiso que fue previamente asignado con <code>GRANT</code>?", a: ["REMOVE", "DELETE", "UNGRANT", "REVOKE"], correct: 3 },
                { q: "En el Control de Acceso Discrecional (DAC), ¿quién tiene inicialmente la autoridad para conceder permisos sobre un objeto recién creado?", a: ["El administrador de la base de datos (DBA) únicamente", "Cualquier usuario con el rol de 'admin'", "El propietario del objeto (quien lo creó)", "Nadie, los permisos deben ser solicitados explícitamente"], correct: 2 }
            ]
        };
        
        let currentQuizAnswers = {};

        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        };

        const getModuleFromURL = () => {
            const params = new URLSearchParams(window.location.search);
            return params.get('module');
        };

        window.generateQuiz = (module = null) => {
            const quizForm = document.getElementById('quiz-form');
            const resultsContainer = document.getElementById('results');
            const quizTitle = document.querySelector('.container h2');
            quizForm.innerHTML = '';
            resultsContainer.innerHTML = '';
            currentQuizAnswers = {};
            let questionNumber = 1;
            let questionsToGenerate = [];

            if (module && questionBank[module]) {
                quizTitle.textContent = `Cuestionario del Módulo ${module} 🧠`;
                const questions = [...questionBank[module]];
                shuffleArray(questions);
                questionsToGenerate = questions.slice(0, 5); // 5 questions for a specific module
            } else {
                quizTitle.textContent = 'Cuestionario Aleatorio 🧠';
                for (const category in questionBank) {
                    const questions = [...questionBank[category]];
                    shuffleArray(questions);
                    questionsToGenerate.push(...questions.slice(0, 2)); // 2 questions from each category for the general quiz
                }
                shuffleArray(questionsToGenerate);
            }

            questionsToGenerate.forEach((questionData, index) => {
                const questionId = `q_${index}`;
                currentQuizAnswers[questionId] = questionData.correct;

                const questionDiv = document.createElement('div');
                questionDiv.className = 'quiz-question';
                questionDiv.id = `q_div_${questionId}`;
                
                let optionsHtml = '';
                questionData.a.forEach((option, optionIndex) => {
                    optionsHtml += `<label><input type="radio" name="${questionId}" value="${optionIndex}"> ${option}</label>`;
                });
                
                questionDiv.innerHTML = `<p>${questionNumber}. ${questionData.q}</p>${optionsHtml}`;
                quizForm.appendChild(questionDiv);
                questionNumber++;
            });
        };

        window.submitQuiz = () => {
            const resultsContainer = document.getElementById('results');
            let score = 0;
            
            for (const questionId in currentQuizAnswers) {
                const radioButtons = document.getElementsByName(questionId);
                const questionDiv = document.getElementById(`q_div_${questionId}`);
                const userAnswerNode = Array.from(radioButtons).find(r => r.checked);
                
                questionDiv.querySelectorAll('label').forEach(label => label.classList.remove('user-answer'));

                if (userAnswerNode) {
                    userAnswerNode.parentElement.classList.add('user-answer');
                    const userAnswer = parseInt(userAnswerNode.value);
                    if (userAnswer === currentQuizAnswers[questionId]) {
                        score++;
                        questionDiv.classList.add('correct');
                        questionDiv.classList.remove('incorrect');
                    } else {
                        questionDiv.classList.add('incorrect');
                        questionDiv.classList.remove('correct');
                    }
                } else {
                    questionDiv.classList.add('incorrect');
                    questionDiv.classList.remove('correct');
                }
            }

            resultsContainer.innerHTML = `Tu puntaje es: ${score} de ${Object.keys(currentQuizAnswers).length} correctas.`;
            if (score === Object.keys(currentQuizAnswers).length) {
                resultsContainer.innerHTML += " ¡Excelente! 🎉";
            }
        };
        
        // Generate the quiz based on the URL
        const module = getModuleFromURL();
        generateQuiz(module);
    }
});