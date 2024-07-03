document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const contextMenu = document.getElementById('contextMenu');
    const svgCanvas = document.getElementById('svgCanvas');
    let selectedCircle = null;
    let isConnecting = false;

    dropdownButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('menu');
    });

    dropdownMenu.addEventListener('click', (event) => {
        const blockClass = event.target.dataset.block;
        const blocks = document.querySelectorAll(`.${blockClass}`);
        blocks.forEach(block => {
            block.classList.toggle('block-hidden');
            updateSvgVisibility();
        });
        dropdownMenu.classList.add('menu');
    });

    document.addEventListener('click', () => {
        contextMenu.classList.add('menu');
    });

    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (!event.target.classList.contains('circle')) return;
        selectedCircle = event.target;
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.classList.remove('menu');
    });

    function toggleCircle(line, event) {
        const minDistance = 30; 

        for (const circle of line.querySelectorAll('.circle')) {
            if (circle.style.display === 'block' && Math.abs(event.offsetX - parseInt(circle.style.left)) < minDistance) {
                return; 
            }
        }

        const circle = document.createElement('div');
        circle.classList.add('circle', line.classList[1]);
        circle.style.left = `${event.offsetX - 10}px`;
        line.appendChild(circle);
        circle.style.display = 'block';

        circle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isConnecting && selectedCircle && selectedCircle !== circle) {
                if (selectedCircle.parentElement.classList[1] !== circle.parentElement.classList[1]) {
                    return; 
                }
                const startX = selectedCircle.getBoundingClientRect().left + selectedCircle.offsetWidth / 2;
                const startY = selectedCircle.getBoundingClientRect().top + selectedCircle.offsetHeight / 2;
                const endX = circle.getBoundingClientRect().left + circle.offsetWidth / 2;
                const endY = circle.getBoundingClientRect().top + circle.offsetHeight / 2;

                const svgRect = svgCanvas.getBoundingClientRect();

                const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                lineElement.setAttribute('x1', startX - svgRect.left);
                lineElement.setAttribute('y1', startY - svgRect.top);
                lineElement.setAttribute('x2', startX - svgRect.left);
                lineElement.setAttribute('y2', startY - svgRect.top);
                lineElement.setAttribute('stroke', getComputedStyle(selectedCircle).borderColor);
                lineElement.setAttribute('class', 'connection-line');
                svgCanvas.appendChild(lineElement);

                requestAnimationFrame(() => {
                    lineElement.setAttribute('x2', endX - svgRect.left);
                    lineElement.setAttribute('y2', endY - svgRect.top);
                });

                selectedCircle.classList.remove('selected');
                selectedCircle = null;
                isConnecting = false;
            }
        });

        circle.addEventListener('mouseover', () => {
            circle.classList.add('hovered');
        });

        circle.addEventListener('mouseout', () => {
            circle.classList.remove('hovered');
        });
    }

    contextMenu.addEventListener('click', (event) => {
        if (event.target.textContent === 'Удалить') {
            const textElement = selectedCircle.parentElement.querySelector('.circle-text');
            if (textElement) {
                textElement.remove();
            }
            selectedCircle.remove();
        } else if (event.target.textContent === 'Соединить') {
            isConnecting = true;
            if (selectedCircle) {
                selectedCircle.classList.add('selected');
            }
        } else if (event.target.textContent === 'Редактировать') {
            showEditField();
        }
        contextMenu.classList.add('menu');
    });

    function showEditField() {
        const existingField = document.getElementById('editField');
        if (existingField) {
            existingField.remove();
        }
        const existingText = selectedCircle.parentElement.querySelector('.circle-text');
        if (existingText) {
            existingText.remove();
        }
        const editField = document.createElement('input');
        editField.id = 'editField';
        editField.type = 'text';
        editField.className = 'absolute z-10 border rounded px-1 py-0.5';
        editField.style.left = `${selectedCircle.offsetLeft + 25}px`;
        editField.style.top = `${selectedCircle.offsetTop}px`;
        const borderColor = getComputedStyle(selectedCircle).borderColor;
        editField.style.color = borderColor;
        selectedCircle.parentElement.appendChild(editField);
        editField.focus();
        const submitText = () => {
            const text = editField.value.trim();
            if (text) {
                const span = document.createElement('span');
                span.textContent = text;
                span.className = 'circle-text absolute';
                span.style.color = borderColor;
                span.style.left = `${selectedCircle.offsetLeft}px`;
                span.style.top = `${selectedCircle.offsetTop - 20}px`;
                selectedCircle.parentElement.appendChild(span);
            }
            editField.remove();
        };
        editField.addEventListener('blur', submitText);
        editField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                submitText();
            }
        });
    }

    function generateDatesAndLines() {
        const dateContainer = document.getElementById('dateContainer');
        const numCircles = 20; 
        const circleSpacing = 30;

        for (let i = 2; i <= 30; i++) {
            const date = new Date(2024, 0, i);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const flexItem = document.createElement('div');
            flexItem.classList.add('flex-item');
            flexItem.innerHTML = `
                <div class="date">${day}.${month}</div>
                <div class="line col-k"></div>
                <div class="line col-s"></div>
                <div class="line col-p"></div>
                <div class="placeholder placeholder-k"></div>
                <div class="placeholder placeholder-s"></div>
                <div class="placeholder placeholder-p"></div>
            `;
            dateContainer.appendChild(flexItem);

            const lines = flexItem.querySelectorAll('.line');
            lines.forEach(line => {
                for (let j = 0; j < numCircles; j++) {
                    const circle = document.createElement('div');
                    circle.classList.add('circle', line.classList[1]);
                    circle.style.left = `${circleSpacing * j}px`;
                    circle.style.display = 'none'; 
                    line.appendChild(circle);

                    circle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isConnecting && selectedCircle && selectedCircle !== circle) {
                            if (selectedCircle.parentElement.classList[1] !== circle.parentElement.classList[1]) {
                                return; 
                            }
                            const startX = selectedCircle.getBoundingClientRect().left + selectedCircle.offsetWidth / 2;
                            const startY = selectedCircle.getBoundingClientRect().top + selectedCircle.offsetHeight / 2;
                            const endX = circle.getBoundingClientRect().left + circle.offsetWidth / 2;
                            const endY = circle.getBoundingClientRect().top + circle.offsetHeight / 2;

                            const svgRect = svgCanvas.getBoundingClientRect();

                            const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                            lineElement.setAttribute('x1', startX - svgRect.left);
                            lineElement.setAttribute('y1', startY - svgRect.top);
                            lineElement.setAttribute('x2', startX - svgRect.left);
                            lineElement.setAttribute('y2', startY - svgRect.top);
                            lineElement.setAttribute('stroke', getComputedStyle(selectedCircle).borderColor);
                            lineElement.setAttribute('class', 'connection-line');
                            svgCanvas.appendChild(lineElement);

                            requestAnimationFrame(() => {
                                lineElement.setAttribute('x2', endX - svgRect.left);
                                lineElement.setAttribute('y2', endY - svgRect.top);
                            });

                            selectedCircle.classList.remove('selected');
                            selectedCircle = null;
                            isConnecting = false;
                        }
                    });

                    circle.addEventListener('mouseover', () => {
                        circle.classList.add('hovered');
                    });

                    circle.addEventListener('mouseout', () => {
                        circle.classList.remove('hovered');
                    });
                }
                line.addEventListener('click', (event) => {
                    if (!event.target.classList.contains('circle')) {
                        toggleCircle(line, event);
                    }
                });
            });
        }
    }

    function updateSvgVisibility() {
        const lines = document.querySelectorAll('.line');
        lines.forEach(line => {
            const circles = line.querySelectorAll('.circle');
            circles.forEach(circle => {
                const circleRect = circle.getBoundingClientRect();
                const svgRect = svgCanvas.getBoundingClientRect();
                const connections = svgCanvas.querySelectorAll('.connection-line');
                connections.forEach(connection => {
                    const x1 = parseFloat(connection.getAttribute('x1')) + svgRect.left;
                    const y1 = parseFloat(connection.getAttribute('y1')) + svgRect.top;
                    const x2 = parseFloat(connection.getAttribute('x2')) + svgRect.left;
                    const y2 = parseFloat(connection.getAttribute('y2')) + svgRect.top;
                    if ((Math.abs(circleRect.left - x1) < 5 && Math.abs(circleRect.top - y1) < 5) ||
                        (Math.abs(circleRect.left - x2) < 5 && Math.abs(circleRect.top - y2) < 5)) {
                        if (line.classList.contains('block-hidden')) {
                            connection.style.display = 'none';
                        } else {
                            connection.style.display = 'block';
                        }
                    }
                });
            });
        });
    }

    generateDatesAndLines();
});
