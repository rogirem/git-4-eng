document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const contextMenu = document.getElementById('contextMenu');
    let selectedCircle = null;
    let isConnecting = false;
    let currentLine = null;

    dropdownButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('menu');
    });

    dropdownMenu.addEventListener('click', (event) => {
        const blockClass = event.target.dataset.block;
        const blocks = document.querySelectorAll(`.${blockClass}`);
        blocks.forEach(block => {
            block.classList.toggle('block-hidden');
        });
        dropdownMenu.classList.add('menu');
    });

    document.addEventListener('click', () => {
        contextMenu.classList.add('menu');
        if (isConnecting) {
            isConnecting = false;
            document.body.removeChild(currentLine);
            currentLine = null;
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (isConnecting) {
            const startX = selectedCircle.getBoundingClientRect().left + selectedCircle.offsetWidth / 2;
            const startY = selectedCircle.getBoundingClientRect().top + selectedCircle.offsetHeight / 2;
            currentLine.style.width = `${Math.hypot(event.pageX - startX, event.pageY - startY)}px`;
            currentLine.style.transform = `rotate(${Math.atan2(event.pageY - startY, event.pageX - startX)}rad)`;
            currentLine.style.left = `${startX}px`;
            currentLine.style.top = `${startY}px`;
        }
    });

    function toggleCircle(line, event) {
        const circles = line.querySelectorAll('.circle');
        const minDistance = 30; 

        for (const circle of circles) {
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
        });

        circle.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            selectedCircle = circle;
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.classList.remove('menu');
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
            selectedCircle.style.display = 'none';
        } else if (event.target.textContent === 'Соединить') {
            isConnecting = true;
            currentLine = document.createElement('div');
            currentLine.style.position = 'absolute';
            currentLine.style.border = `1px solid ${getComputedStyle(selectedCircle).borderColor}`;
            document.body.appendChild(currentLine);
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
                span.style.transform = 'rotate(-90deg)';
                span.style.transformOrigin = 'left top 0';
                span.style.left = `${selectedCircle.offsetLeft + 10}px`;
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
        }

        document.querySelectorAll('.line').forEach(line => {
            line.addEventListener('click', (event) => {
                if (event.target.classList.contains('circle')) {
                    return;
                }
                toggleCircle(line, event);
            });

            line.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                if (!event.target.classList.contains('circle')) return;
                selectedCircle = event.target;
                contextMenu.style.left = `${event.pageX}px`;
                contextMenu.style.top = `${event.pageY}px`;
                contextMenu.classList.remove('menu');
            });
        });
    }

    generateDatesAndLines();
});
