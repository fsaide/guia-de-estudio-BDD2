document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('checkbox');

    const applyTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme ? savedTheme === 'dark' : document.body.dataset.defaultTheme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        if (themeToggle) themeToggle.checked = isDark;
    };

    if (themeToggle) {
        themeToggle.setAttribute('aria-label', 'Cambiar tema de color');
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

    applyTheme();

    const moduleShell = document.querySelector('.module-shell');

    if (moduleShell) {
        const moduleSidebar = moduleShell.querySelector('.module-sidebar');
        const moduleMain = moduleShell.querySelector('.module-content-panel');
        const pageHeader = moduleMain.querySelector('.page-header');
        const moduleNav = pageHeader.querySelector('.module-nav');
        const activeModuleLink = moduleNav.querySelector('.nav-link.active');
        const moduleMatch = activeModuleLink.href.match(/module(\d+)\.html$/);
        const currentModule = moduleMatch ? Number(moduleMatch[1]) : null;
        const moduleNames = Array.from(moduleNav.querySelectorAll('.nav-link')).map((link) => ({
            href: link.getAttribute('href'),
            label: link.textContent.trim()
        }));
        const currentModuleName = activeModuleLink.textContent.trim().replace(/^\d+\.\s*/, '');
        const viewedModulesStorageKey = 'studyGuideViewedModules';
        const storedViewedModules = JSON.parse(localStorage.getItem(viewedModulesStorageKey) || '[]');
        const viewedModules = Array.isArray(storedViewedModules) ? storedViewedModules : [];

        if (currentModule && !viewedModules.includes(currentModule)) {
            viewedModules.push(currentModule);
            localStorage.setItem(viewedModulesStorageKey, JSON.stringify(viewedModules));
        }

        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'module-breadcrumb';
        breadcrumb.setAttribute('aria-label', 'Migas de pan');
        breadcrumb.innerHTML = `<a href="summary.html">Guía</a><span aria-hidden="true">/</span><span>BD2</span><span aria-hidden="true">/</span><span aria-current="page">Módulo ${currentModule}</span>`;
        pageHeader.insertBefore(breadcrumb, moduleNav);

        const moduleIndex = document.createElement('details');
        moduleIndex.className = 'module-index';
        moduleIndex.open = window.innerWidth > 760;
        moduleIndex.innerHTML = '<summary>Temario del curso</summary>';
        const moduleIndexList = document.createElement('ul');

        moduleNames.forEach((module, index) => {
            const moduleNumber = index + 1;
            const item = document.createElement('li');
            const link = document.createElement('a');
            const status = document.createElement('span');
            link.href = module.href;
            link.textContent = module.label;
            status.className = 'module-status';
            const isViewed = viewedModules.includes(moduleNumber);
            status.classList.toggle('is-viewed', isViewed);
            status.textContent = isViewed ? '✓ Visto' : '○ Pendiente';
            status.setAttribute('aria-label', status.textContent);
            item.classList.toggle('is-current', moduleNumber === currentModule);
            item.append(link, status);
            moduleIndexList.appendChild(item);
        });

        moduleIndex.appendChild(moduleIndexList);
        moduleSidebar.appendChild(moduleIndex);

        const sectionNav = moduleSidebar.querySelector('.module-toc');
        if (sectionNav) {
            const sectionIndex = document.createElement('details');
            sectionIndex.className = 'section-index';
            sectionIndex.open = window.innerWidth > 760;
            const summary = document.createElement('summary');
            summary.textContent = 'En este apunte';
            sectionIndex.appendChild(summary);
            sectionNav.replaceWith(sectionIndex);
            sectionIndex.appendChild(sectionNav);
        }

        const progressPanel = document.createElement('section');
        progressPanel.className = 'module-progress';
        progressPanel.setAttribute('aria-label', 'Progreso de módulos visitados');
        const viewedCount = viewedModules.length;
        const progressPercentage = Math.round((viewedCount / moduleNames.length) * 100);
        progressPanel.innerHTML = `<div class="module-progress-label"><span>Módulos visitados</span><strong>${viewedCount}/${moduleNames.length}</strong></div><div class="module-progress-track" role="progressbar" aria-label="Módulos visitados" aria-valuemin="0" aria-valuemax="${moduleNames.length}" aria-valuenow="${viewedCount}"><span style="width: ${progressPercentage}%"></span></div>`;
        moduleSidebar.appendChild(progressPanel);

        const moduleActions = moduleMain.querySelector('.module-actions');
        const quickActions = document.createElement('aside');
        quickActions.className = 'module-quick-actions';
        quickActions.setAttribute('aria-label', 'Acciones del módulo');

        const quickActionsHeading = document.createElement('h2');
        quickActionsHeading.textContent = 'Para estudiar';
        quickActions.appendChild(quickActionsHeading);

        const assessmentLink = moduleActions.querySelector('a[href*="quiz.html"]');
        if (assessmentLink) {
            const assessmentCard = document.createElement('section');
            assessmentCard.className = 'quick-action-card assessment-card';
            assessmentCard.innerHTML = '<span class="section-kicker">Autoevaluación</span><h3>¿Qué aprendiste?</h3><p>Comprueba lo que entendiste con preguntas de distintos niveles.</p>';
            const assessmentButton = assessmentLink.cloneNode(true);
            assessmentButton.className = 'btn';
            assessmentButton.textContent = 'Resolver cuestionario';
            assessmentCard.appendChild(assessmentButton);
            quickActions.appendChild(assessmentCard);
        }

        const practiceCard = document.createElement('section');
        practiceCard.className = 'quick-action-card practice-action-card';
        practiceCard.innerHTML = '<span class="section-kicker">Poner en práctica</span><h3>Ejercicios del tema</h3><p>Refuerza los conceptos con la práctica correspondiente.</p>';
        const practiceLink = document.createElement('a');
        practiceLink.className = 'btn btn-secondary';
        practiceLink.href = `practice${currentModule}.html`;
        practiceLink.textContent = 'Abrir práctica';
        practiceCard.appendChild(practiceLink);
        quickActions.appendChild(practiceCard);

        const downloadCard = moduleMain.querySelector('.download-card');
        if (downloadCard) {
            quickActions.appendChild(downloadCard);
            downloadCard.querySelectorAll('.download-grid a').forEach((link) => {
                const fileName = new URL(link.href).pathname.split('/').pop() || '';
                const format = fileName.split('.').pop().toUpperCase();
                const size = document.createElement('small');
                size.className = 'download-file-meta';
                size.textContent = `${format} · Consultando tamaño`;
                link.insertAdjacentElement('afterend', size);

                fetch(link.href, { method: 'HEAD' }).then((response) => {
                    if (!response.ok) throw new Error(`No se pudo consultar ${link.href}: ${response.status}`);
                    const bytes = Number(response.headers.get('content-length'));
                    if (!Number.isFinite(bytes) || bytes <= 0) {
                        size.textContent = `${format} · Tamaño no disponible`;
                        return;
                    }

                    const fileSize = bytes >= 1024 * 1024
                        ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
                        : `${Math.ceil(bytes / 1024)} KB`;
                    size.textContent = `${format} · ${fileSize}`;
                }).catch((error) => {
                    size.textContent = `${format} · No se pudo consultar el tamaño`;
                    console.error(error);
                });
            });
        }
        if (moduleActions) moduleActions.remove();
        moduleNav.remove();
        moduleShell.appendChild(quickActions);

        moduleSidebar.querySelectorAll('.module-toc a').forEach((link) => {
            link.addEventListener('click', () => {
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    moduleSidebar.querySelectorAll('.module-toc a').forEach((item) => {
                        item.classList.toggle('is-current', item === link);
                    });
                }
            });
        });

        if ('IntersectionObserver' in window) {
            const sectionObserver = new IntersectionObserver((entries) => {
                const visibleEntry = entries.find((entry) => entry.isIntersecting);
                if (!visibleEntry) return;

                moduleSidebar.querySelectorAll('.module-toc a').forEach((link) => {
                    const isCurrent = link.hash === `#${visibleEntry.target.id}`;
                    link.classList.toggle('is-current', isCurrent);
                    if (isCurrent) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                });
            }, { rootMargin: '-15% 0px -70% 0px' });

            moduleMain.querySelectorAll('.module-content > section[id]').forEach((section) => {
                sectionObserver.observe(section);
            });
        }

        const videoBlocks = moduleMain.querySelectorAll('.video-block');
        videoBlocks.forEach((videoBlock) => {
            const video = videoBlock.querySelector('video');
            if (!video) return;

            const metadata = document.createElement('p');
            metadata.className = 'video-metadata';
            metadata.textContent = 'Video del módulo';
            videoBlock.insertBefore(metadata, video);
            video.addEventListener('loadedmetadata', () => {
                if (Number.isFinite(video.duration)) {
                    const minutes = Math.floor(video.duration / 60);
                    const seconds = String(Math.floor(video.duration % 60)).padStart(2, '0');
                    metadata.textContent = `Video del módulo · ${minutes}:${seconds} min`;
                }
            }, { once: true });
        });

        const mainHeading = moduleMain.querySelector('.module-hero h2');
        if (mainHeading) mainHeading.id = 'module-title';
        moduleMain.querySelectorAll('.module-content > section[id]').forEach((section) => {
            section.setAttribute('tabindex', '-1');
        });
        moduleSidebar.querySelector('h3').setAttribute('aria-label', `Módulo ${currentModule}: ${currentModuleName}`);
    }

    if (document.getElementById('quiz-form')) {
        const quizForm = document.getElementById('quiz-form');
        const resultsContainer = document.getElementById('results');

        const questionBank = {
            1: {
                easy: [
                    { q: "Si quieres encontrar todos los nombres que terminan con 'an', ¿qué condición <code>LIKE</code> usarías?", a: ["LIKE 'an%'", "LIKE '_an'", "LIKE '%an'", "LIKE 'an_'"], correct: 2, difficulty: 'easy' },
                    { q: "¿Qué tipo de <code>JOIN</code> incluirá todas las filas de la tabla izquierda, incluso si no tienen coincidencias en la tabla derecha?", a: ["INNER JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "LEFT JOIN"], correct: 3, difficulty: 'easy' }
                ],
                medium: [
                    { q: "¿En qué orden lógico se procesan las cláusulas <code>WHERE</code>, <code>GROUP BY</code> y <code>HAVING</code>?", a: ["WHERE, HAVING, GROUP BY", "WHERE, GROUP BY, HAVING", "GROUP BY, WHERE, HAVING", "HAVING, WHERE, GROUP BY"], correct: 1, difficulty: 'medium' },
                    { q: "La función de agregación <code>AVG(columna)</code>, ¿qué hace con los valores <code>NULL</code> de la columna?", a: ["Los trata como si fueran 0", "Provoca un error en la consulta", "Los ignora completamente del cálculo", "Los promedia con los demás valores"], correct: 2, difficulty: 'medium' }
                ],
                advanced: [
                    { q: "¿Cuál es el propósito del operador <code>EXISTS</code> en una subconsulta?", a: ["Contar el número de filas que devuelve la subconsulta", "Verificar si la subconsulta devuelve al menos una fila", "Sumar los valores de una columna en la subconsulta", "Devolver el primer valor de la subconsulta"], correct: 1, difficulty: 'advanced' }
                ]
            },
            2: {
                easy: [
                    { q: "¿Cuál de estas afirmaciones sobre una <code>PRIMARY KEY</code> es CIERTA?", a: ["Puede contener valores NULL", "Puede haber múltiples claves primarias en una tabla", "Implica las restricciones UNIQUE y NOT NULL", "Es menos eficiente que una restricción UNIQUE"], correct: 2, difficulty: 'easy' }
                ],
                medium: [
                    { q: "Si una clave foránea tiene la acción referencial <code>ON DELETE CASCADE</code>, ¿qué sucede si se borra el registro padre referenciado?", a: ["La operación de borrado es rechazada", "El valor de la clave foránea en los registros hijos se pone a NULL", "Todos los registros hijos que la referencian también son borrados", "El valor de la clave foránea se cambia a su valor por defecto"], correct: 2, difficulty: 'medium' },
                    { q: "La cláusula <code>MATCH FULL</code> en una clave foránea compuesta significa que:", a: ["Todos los valores de la clave foránea deben ser NULL, o todos deben ser no nulos y existir en la tabla referenciada", "Al menos uno de los valores de la clave foránea debe coincidir", "Se ignoran los valores nulos para la validación", "Se permite cualquier combinación de valores nulos y no nulos"], correct: 0, difficulty: 'medium' }
                ],
                advanced: [
                    { q: "Una restricción de tipo <code>ASSERTION</code> en el estándar SQL se caracteriza por:", a: ["Aplicar solo a una columna específica", "Poder involucrar múltiples tablas para validar una regla de negocio global", "Ejecutarse solo cuando un usuario específico modifica datos", "Ser la restricción más eficiente y recomendada para usar"], correct: 1, difficulty: 'advanced' }
                ]
            },
            4: {
                easy: [
                    { q: "¿Cuál es la principal desventaja de una <b>Vista Materializada</b>?", a: ["No se puede usar en consultas complejas", "Los datos pueden quedar desactualizados y necesitan ser refrescados", "Ocupa menos espacio que una tabla normal", "Es más lenta para consultas que una vista normal"], correct: 1, difficulty: 'easy' }
                ],
                medium: [
                    { q: "Si ejecutas un <code>UPDATE</code> en una vista definida con <code>WITH CHECK OPTION</code>, ¿qué comprobará el SGBD?", a: ["Que el usuario tenga permisos de UPDATE", "Que la nueva fila modificada siga cumpliendo la condición del <code>WHERE</code> de la vista", "Que la tabla base tenga un índice en la columna actualizada", "Que no haya triggers en la tabla base"], correct: 1, difficulty: 'medium' },
                    { q: "¿Cuál de las siguientes cláusulas <b>impediría</b> que una vista sea automáticamente actualizable en PostgreSQL?", a: ["WHERE", "ORDER BY", "GROUP BY", "LIMIT en una subconsulta"], correct: 2, difficulty: 'medium' }
                ],
                advanced: [
                    { q: "Para hacer que una vista no actualizable automáticamente en PostgreSQL pueda manejar operaciones DML, ¿qué se debe utilizar?", a: ["La cláusula <code>WITH CHECK OPTION</code>", "Un trigger de tipo <code>AFTER</code>", "Un trigger de tipo <code>INSTEAD OF</code>", "Una función almacenada especial llamada <code>UPDATE_VIEW</code>"], correct: 2, difficulty: 'advanced' }
                ]
            },
            3: {
                easy: [
                    { q: "En un trigger <code>FOR EACH ROW</code>, ¿qué contiene la variable especial <code>OLD</code> durante una operación de <code>INSERT</code>?", a: ["Los datos de la fila que se está insertando", "Es <code>NULL</code> o no está definida", "Los datos de la última fila que fue borrada", "Un valor de error"], correct: 1, difficulty: 'easy' }
                ],
                medium: [
                    { q: "La principal diferencia entre una <code>FUNCTION</code> y un <code>PROCEDURE</code> en SQL es que...", a: ["Las funciones no pueden recibir parámetros", "Los procedimientos se ejecutan automáticamente", "Las funciones siempre deben devolver un valor, mientras que los procedimientos no", "Los procedimientos no pueden modificar datos en las tablas"], correct: 2, difficulty: 'medium' },
                    { q: "Si quieres que un trigger se ejecute para validar los datos justo antes de que se escriban en la tabla, ¿qué combinación usarías?", a: ["AFTER INSERT", "BEFORE INSERT", "INSTEAD OF INSERT", "AFTER UPDATE"], correct: 1, difficulty: 'medium' }
                ],
                advanced: [
                    { q: "En PostgreSQL, la lógica (la acción) de un trigger se define dentro de:", a: ["La misma declaración <code>CREATE TRIGGER</code>", "Un bloque anónimo en el trigger", "Una función especial que devuelve el tipo <code>trigger</code>", "Un archivo de script externo"], correct: 2, difficulty: 'advanced' }
                ]
            },
            5: {
                easy: [
                    { q: "El comando <code>EXPLAIN</code> en PostgreSQL se utiliza para...", a: ["Ejecutar una consulta y medir el tiempo exacto que tarda", "Mostrar el plan de ejecución que el optimizador ha elegido para una consulta", "Crear un índice automáticamente para una consulta lenta", "Explicar el significado de una función SQL"], correct: 1, difficulty: 'easy' }
                ],
                medium: [
                    { q: "La optimización heurística se basa en aplicar reglas para mejorar una consulta. ¿Cuál es una de las reglas más importantes?", a: ["Realizar los <code>JOIN</code> antes que cualquier filtro <code>WHERE</code>", "Evitar el uso de índices para no confundir al optimizador", "Realizar las operaciones de filtrado (Selección) y reducción de columnas (Proyección) lo antes posible", "Siempre usar <code>UNION ALL</code> en lugar de <code>UNION</code>"], correct: 2, difficulty: 'medium' },
                    { q: "Un índice de tipo <b>Hash</b> es más eficiente para qué tipo de operación?", a: ["Búsquedas por rango de valores", "Ordenamiento de resultados", "Búsquedas por igualdad exacta", "Agrupaciones por grandes volúmenes de datos"], correct: 2, difficulty: 'medium' }
                ],
                advanced: [
                    { q: "La optimización basada en costo depende fundamentalmente de:", a: ["La velocidad de la CPU del servidor", "Las estadísticas actualizadas sobre los datos de la base de datos", "La cantidad de memoria RAM disponible", "El número de usuarios conectados"], correct: 1, difficulty: 'advanced' }
                ]
            },
            6: {
                easy: [
                    { q: "¿Qué comando se utiliza para quitar un permiso que fue previamente asignado con <code>GRANT</code>?", a: ["REMOVE", "DELETE", "UNGRANT", "REVOKE"], correct: 3, difficulty: 'easy' }
                ],
                medium: [
                    { q: "El modelo de seguridad donde los permisos se asignan a grupos (roles) y los usuarios se asignan a esos grupos se conoce como:", a: ["Control de Acceso Discrecional (DAC)", "Control de Acceso Obligatorio (MAC)", "Control de Acceso Basado en Roles (RBAC)", "Control de Acceso por Niveles (LAC)"], correct: 2, difficulty: 'medium' },
                    { q: "En el Control de Acceso Discrecional (DAC), ¿quién tiene inicialmente la autoridad para conceder permisos sobre un objeto recién creado?", a: ["El administrador de la base de datos (DBA) únicamente", "Cualquier usuario con el rol de 'admin'", "El propietario del objeto (quien lo creó)", "Nadie, los permisos deben ser solicitados explícitamente"], correct: 2, difficulty: 'medium' }
                ],
                advanced: [
                    { q: "¿Qué permite la cláusula <code>WITH GRANT OPTION</code> al conceder un permiso?", a: ["Que el permiso solo sea válido por un tiempo limitado", "Que el usuario que recibe el permiso pueda a su vez concedérselo a otros usuarios", "Que el permiso se aplique a todas las tablas de la base de datos", "Que se registre en un log cada vez que el permiso es usado"], correct: 1, difficulty: 'advanced' }
                ]
            }
        };

        const difficultyLabels = { easy: 'Fácil', medium: 'Intermedio', advanced: 'Avanzado' };
        let currentQuizAnswers = {};
        let currentDifficulty = 'all';

        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        };

        const flattenQuestions = (moduleQuestions) => {
            const flattened = [];
            Object.keys(moduleQuestions).forEach((difficulty) => {
                moduleQuestions[difficulty].forEach((question) => flattened.push({ ...question, difficulty }));
            });
            return flattened;
        };

        const buildQuestionSet = (availableQuestions, targetCount, selectedDifficulty = 'all') => {
            const grouped = { easy: [], medium: [], advanced: [] };
            availableQuestions.forEach((question) => {
                if (grouped[question.difficulty]) grouped[question.difficulty].push(question);
            });

            const difficultyOrder = selectedDifficulty === 'all' ? ['easy', 'medium', 'advanced'] : [selectedDifficulty];
            const selected = [];

            difficultyOrder.forEach((difficulty) => {
                const questions = [...grouped[difficulty]];
                shuffleArray(questions);
                const take = Math.min(questions.length, Math.max(1, Math.ceil(targetCount / difficultyOrder.length)));
                selected.push(...questions.slice(0, take));
            });

            const unique = [];
            const seen = new Set();
            selected.forEach((question) => {
                const signature = `${question.q}|${question.correct}`;
                if (!seen.has(signature)) {
                    seen.add(signature);
                    unique.push(question);
                }
            });

            if (unique.length < targetCount) {
                const remaining = availableQuestions.filter((question) => !unique.includes(question));
                shuffleArray(remaining);
                unique.push(...remaining.slice(0, targetCount - unique.length));
            }

            if (unique.length > targetCount) {
                shuffleArray(unique);
                return unique.slice(0, targetCount);
            }

            shuffleArray(unique);
            return unique;
        };

        const getModuleFromURL = () => {
            const params = new URLSearchParams(window.location.search);
            return params.get('module');
        };

        const renderQuestionGroups = (questions) => {
            const groupedQuestions = { easy: [], medium: [], advanced: [] };
            questions.forEach((questionData) => {
                groupedQuestions[questionData.difficulty].push(questionData);
            });

            const order = ['easy', 'medium', 'advanced'];
            let questionNumber = 1;

            order.forEach((difficulty) => {
                const sectionQuestions = groupedQuestions[difficulty];
                if (!sectionQuestions.length) return;

                const section = document.createElement('section');
                section.className = `difficulty-group difficulty-${difficulty}`;

                const heading = document.createElement('h3');
                heading.className = 'difficulty-heading';
                heading.textContent = `${difficultyLabels[difficulty]} (${sectionQuestions.length})`;
                section.appendChild(heading);

                sectionQuestions.forEach((questionData) => {
                    const questionId = `q_${questionNumber}`;
                    currentQuizAnswers[questionId] = questionData.correct;

                    const questionDiv = document.createElement('fieldset');
                    questionDiv.className = 'quiz-question';
                    questionDiv.id = `q_div_${questionId}`;

                    let optionsHtml = '';
                    questionData.a.forEach((option, optionIndex) => {
                        const required = optionIndex === 0 ? 'required' : '';
                        optionsHtml += `<label><input type="radio" name="${questionId}" value="${optionIndex}" ${required}> ${option}</label>`;
                    });

                    const answerReveal = document.createElement('details');
                    answerReveal.className = 'answer-reveal';
                    const answerSummary = document.createElement('summary');
                    answerSummary.textContent = 'Ver respuesta';
                    const correctAnswer = document.createElement('p');
                    correctAnswer.innerHTML = questionData.a[questionData.correct];
                    answerReveal.append(answerSummary, correctAnswer);
                    questionDiv.innerHTML = `<legend>${questionNumber}. ${questionData.q}</legend>${optionsHtml}`;
                    questionDiv.appendChild(answerReveal);
                    section.appendChild(questionDiv);
                    questionNumber += 1;
                });

                quizForm.appendChild(section);
            });
        };

        window.generateQuiz = (module = null, difficulty = currentDifficulty) => {
            const quizTitle = document.querySelector('.container h2');
            const quizDescription = document.getElementById('quiz-description');

            quizForm.innerHTML = '';
            resultsContainer.innerHTML = '';
            currentQuizAnswers = {};
            currentDifficulty = difficulty;

            let questionsToGenerate = [];
            if (module && questionBank[module]) {
                quizTitle.textContent = `Cuestionario del módulo ${module}`;
                const availableQuestions = flattenQuestions(questionBank[module]);
                const targetCount = Math.min(5, availableQuestions.length);
                questionsToGenerate = buildQuestionSet(availableQuestions, targetCount, difficulty);
                quizDescription.textContent = `${questionsToGenerate.length} preguntas del módulo ${module}.`;
            } else {
                quizTitle.textContent = 'Cuestionario aleatorio';
                const availableQuestions = [];
                Object.keys(questionBank).forEach((moduleId) => {
                    availableQuestions.push(...flattenQuestions(questionBank[moduleId]));
                });
                const targetCount = difficulty === 'all' ? 12 : Math.min(4, availableQuestions.length);
                questionsToGenerate = buildQuestionSet(availableQuestions, targetCount, difficulty);
                quizDescription.textContent = difficulty === 'all'
                    ? `${questionsToGenerate.length} preguntas: equilibrio entre fácil, intermedio y avanzado.`
                    : `${questionsToGenerate.length} preguntas de nivel ${difficultyLabels[difficulty].toLowerCase()}.`;
            }

            renderQuestionGroups(questionsToGenerate);
        };

        window.submitQuiz = () => {
            let score = 0;
            let firstUnansweredOption = null;

            for (const questionId in currentQuizAnswers) {
                const radioButtons = document.getElementsByName(questionId);
                const questionDiv = document.getElementById(`q_div_${questionId}`);
                const userAnswerNode = Array.from(radioButtons).find(r => r.checked);
                const feedbackId = `${questionId}-feedback`;

                questionDiv.querySelectorAll('label').forEach(label => label.classList.remove('user-answer'));

                if (userAnswerNode && !radioButtons[0].validity.valueMissing) {
                    radioButtons.forEach(radio => {
                        radio.removeAttribute('aria-invalid');
                        radio.removeAttribute('aria-describedby');
                    });
                    const feedback = questionDiv.querySelector('.quiz-feedback');
                    if (feedback) feedback.remove();
                    userAnswerNode.parentElement.classList.add('user-answer');
                    const userAnswer = parseInt(userAnswerNode.value, 10);
                    if (userAnswer === currentQuizAnswers[questionId]) {
                        score += 1;
                        questionDiv.classList.add('correct');
                        questionDiv.classList.remove('incorrect');
                    } else {
                        questionDiv.classList.add('incorrect');
                        questionDiv.classList.remove('correct');
                    }
                } else {
                    const feedback = questionDiv.querySelector('.quiz-feedback') || document.createElement('p');
                    feedback.id = feedbackId;
                    feedback.className = 'quiz-feedback';
                    feedback.textContent = 'Te falta responder esta pregunta.';
                    if (!feedback.parentElement) questionDiv.appendChild(feedback);
                    radioButtons.forEach(radio => {
                        radio.setAttribute('aria-invalid', 'true');
                        radio.setAttribute('aria-describedby', feedbackId);
                    });
                    if (!firstUnansweredOption) firstUnansweredOption = radioButtons[0];
                    questionDiv.classList.add('incorrect');
                    questionDiv.classList.remove('correct');
                }
            }

            resultsContainer.textContent = `Resultado: ${score} de ${Object.keys(currentQuizAnswers).length} respuestas correctas.`;
            if (score === Object.keys(currentQuizAnswers).length) {
                resultsContainer.textContent += ' Todas correctas.';
            }
            if (firstUnansweredOption) firstUnansweredOption.focus();
        };

        quizForm.addEventListener('change', (event) => {
            if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'radio') return;

            const questionDiv = event.target.closest('.quiz-question');
            if (!questionDiv) return;

            quizForm.querySelectorAll('.quiz-question.correct, .quiz-question.incorrect').forEach((question) => {
                question.classList.remove('incorrect', 'correct');
            });
            quizForm.querySelectorAll('label.user-answer').forEach((label) => label.classList.remove('user-answer'));

            const feedback = questionDiv.querySelector('.quiz-feedback');
            if (feedback) feedback.remove();
            questionDiv.querySelectorAll('input[type="radio"]').forEach((radio) => {
                radio.removeAttribute('aria-invalid');
                radio.removeAttribute('aria-describedby');
            });
            questionDiv.querySelectorAll('label').forEach((label) => label.classList.remove('user-answer'));
            questionDiv.classList.remove('incorrect', 'correct');
            resultsContainer.textContent = '';
        });

        document.querySelectorAll('.difficulty-btn').forEach((button) => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach((item) => item.classList.toggle('active', item === button));
                const selection = button.dataset.difficulty || 'all';
                const module = getModuleFromURL();
                generateQuiz(module, selection);
            });
        });

        const module = getModuleFromURL();
        generateQuiz(module, currentDifficulty);
    }
});
