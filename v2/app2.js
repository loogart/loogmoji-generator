window.onload = function () {
    const partFolders = ['head', 'body', 'legs'];
    const partSelectors = {
        head: document.getElementById('head-selector'),
        body: document.getElementById('body-selector'),
        legs: document.getElementById('legs-selector'),
        bg: document.getElementById('bg-selector'),
        favorites: document.getElementById('favorites-container')
    };

    const predefinedBackgrounds = [
        '#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FFBD33', '#8D33FF', '#33FFF5', '#F5FF33'
    ];

    let selectedParts = {
        head: '',
        body: '',
        legs: ''
    };

    let selectedBgColor = predefinedBackgrounds[Math.floor(Math.random() * predefinedBackgrounds.length)];

    function fetchPartCounts() {
        return Promise.all(partFolders.map(partType => 
            fetch(`./parts/${partType}/`)
                .then(response => response.text())
                .then(data => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    const files = Array.from(doc.querySelectorAll('a'))
                        .map(a => a.href)
                        .filter(href => href.match(/(head|body|legs)[0-9]+\.(png|jpg|jpeg)$/))
                        .map(href => href.split('/').pop())
                        .sort();
                    return { partType, count: files.length, files };
                })
        ));
    }

    function getFirstPart(partType, files) {
        return files.length > 0 ? `./parts/${partType}/${files[0]}` : '';
    }

    function loadPartSelectors(partCounts) {
        partCounts.forEach(({ partType, count, files }) => {
            if (count > 0) {
                files.forEach(file => {
                    const img = new Image();
                    img.src = `./parts/${partType}/${file}`;
                    img.classList.add('img-fluid', 'col-6', 'col-sm-4', 'p-1');
                    img.onclick = () => {
                        selectedParts[partType] = img.src;
                        buildRobot();
                        const offcanvas = document.querySelector(`#${partType}Offcanvas`);
                        const bsOffcanvas = new bootstrap.Offcanvas(offcanvas);
                        bsOffcanvas.hide();
                    };
                    partSelectors[partType].appendChild(img);
                });
                selectedParts[partType] = getFirstPart(partType, files);
            }
        });

        predefinedBackgrounds.forEach(color => {
            const div = document.createElement('div');
            div.style.backgroundColor = color;
            div.classList.add('col-3', 'p-2');
            div.onclick = () => {
                selectedBgColor = color;
                buildRobot();
                const offcanvas = document.querySelector('#bgOffcanvas');
                const bsOffcanvas = new bootstrap.Offcanvas(offcanvas);
                bsOffcanvas.hide();
            };
            partSelectors.bg.appendChild(div);
        });

        const colorPicker = document.getElementById('colorPicker');
        colorPicker.oninput = (e) => {
            selectedBgColor = e.target.value;
            buildRobot();
        };

        buildRobot();
    }

    function buildRobot() {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1000;
        canvas.height = 1000;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = selectedBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const parts = [
            { type: 'legs', y: 0 },
            { type: 'body', y: 0 },
            { type: 'head', y: 0 }
        ];

        let loadedImages = 0;
        const imagesToLoad = parts.length;
        const loadedParts = {};

        parts.forEach(part => {
            const img = new Image();
            img.src = selectedParts[part.type];
            img.onload = () => {
                loadedParts[part.type] = img;
                loadedImages++;
                if (loadedImages === imagesToLoad) {
                    parts.forEach(p => {
                        const img = loadedParts[p.type];
                        const x = (canvas.width - img.width) / 2;
                        ctx.drawImage(img, x, p.y);
                    });
                }
            };
        });
    }

    window.addToFavorites = function() {
        let favorites = JSON.parse(localStorage.getItem('robotFavorites')) || [];
        const newEntry = {
            head: selectedParts.head,
            body: selectedParts.body,
            legs: selectedParts.legs,
            background: selectedBgColor
        };

        favorites.push(newEntry);
        localStorage.setItem('robotFavorites', JSON.stringify(favorites));
        console.log("Favorites after adding:", favorites);
        updateFavoritesUI();
    };

    function updateFavoritesUI() {
        const favorites = JSON.parse(localStorage.getItem('robotFavorites')) || [];
        console.log("Favorites to display:", favorites);

        partSelectors.favorites.innerHTML = ''; // Clear the existing content

        const row = document.createElement('div');
        row.classList.add('row'); // Create a row container for the columns

        favorites.forEach((entry, index) => {
            const col = document.createElement('div');
            col.classList.add('col-6', 'mb-3'); // Each favorite occupies half the row (2 columns)

            // Create a temporary canvas to draw the complete avatar
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 200;
            tempCanvas.height = 200;
            const tempCtx = tempCanvas.getContext('2d');

            // Scale down to fit the entire character
            const scaleFactor = 0.2; // Adjust this value to scale the character
            tempCtx.scale(scaleFactor, scaleFactor);

            // Fill background
            tempCtx.fillStyle = entry.background;
            tempCtx.fillRect(0, 0, tempCanvas.width / scaleFactor, tempCanvas.height / scaleFactor);

            const parts = [
                { type: 'legs', src: entry.legs, y: 0 },
                { type: 'body', src: entry.body, y: 0 },
                { type: 'head', src: entry.head, y: 0 }
            ];

            let loadedImages = 0;
            const imagesToLoad = parts.length;

            parts.forEach(part => {
                const img = new Image();
                img.src = part.src;
                img.onload = () => {
                    const x = (tempCanvas.width / scaleFactor - img.width) / 2;
                    tempCtx.drawImage(img, x, part.y);
                    loadedImages++;
                    if (loadedImages === imagesToLoad) {
                        tempCtx.scale(1 / scaleFactor, 1 / scaleFactor); // Reset scale
                        const imgElement = new Image();
                        imgElement.src = tempCanvas.toDataURL();
                        imgElement.classList.add('img-fluid', 'mb-2');
                        imgElement.onclick = () => loadFavorite(entry);

                        const removeButton = document.createElement('button');
                        removeButton.classList.add('btn', 'btn-danger');
                        removeButton.innerHTML = '<i class="fas fa-trash"></i>';
                        removeButton.onclick = () => removeFromFavorites(index);

                        col.appendChild(imgElement);
                        col.appendChild(removeButton);

                        row.appendChild(col); // Append each column to the row
                    }
                };
            });
        });

        partSelectors.favorites.appendChild(row); // Append the row to the favorites container
    }

    function loadFavorite(entry) {
        console.log("Loading favorite:", entry);
        selectedParts.head = entry.head;
        selectedParts.body = entry.body;
        selectedParts.legs = entry.legs;
        selectedBgColor = entry.background;
        buildRobot();
    }

    function removeFromFavorites(index) {
        let favorites = JSON.parse(localStorage.getItem('robotFavorites')) || [];
        favorites.splice(index, 1);
        localStorage.setItem('robotFavorites', JSON.stringify(favorites));
        console.log("Favorites after removing:", favorites);
        updateFavoritesUI();
    }

    // Download canvas element as image
    window.download_image = function() {
        var link = document.createElement('a');
        link.download = 'loogmoji3d.png';
        link.href = document.getElementById('canvas').toDataURL();
        link.click();
    };

    // Load part counts and initialize
    fetchPartCounts().then(loadPartSelectors);
    updateFavoritesUI();
};