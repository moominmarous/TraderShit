const CARDCLASS = Object.freeze(['green', 'yellow', 'red']);
const CARDINFO = Object.freeze({
    green: { color: '#BEBC4D', type: 'boon' },
    yellow: { color: '#E3BC7B', type: 'friend' },
    red: { color: '#BE4D4D', type: 'foe' }
});
const COLORS = Object.freeze(['#7B93AB', '#73B7FF', '#A09A44', '#496643', 'burlywood']);
const TEXTCOLOR = Object.freeze(['black', '#4e4cff', 'black', 'black', 'black']);
const ELEMENTS = Object.freeze(['ᨒ', '𖦹', '෴', '𖣂', '☐']);
const PATHS = Object.freeze([
    [-1, 4, -1, 4, 4, 4, -1, 4, -1],
    [-1, 4, -1, -1, 4, 4, -1, 4, -1],
    [-1, 4, -1, -1, 4, -1, -1, 4, -1],
    [-1, -1, -1, -1, 4, -1, -1, 4, -1],
    [-1, -1, -1, -1, 4, 4, -1, 4, -1],
    [-1, -1, -1, -1, -1, 4, -1, -1, -1],
])
let VISIBLE = false;
const DIMENSIONS = {};
const zoomrange = Array.from({ length: 20 }, (_, i) => parseFloat((0.1 * (i + 1)).toFixed(1)));
let zoomIndex = 9
const UNITWIDTH = 20
const STATS = new Array(4);

let isDragging = false;
// let offsetX, offsetY;

const coordPoint = (x = 0, y = 0) => {
    return { x: x, y: y }
}

let start = coordPoint();
let offset = coordPoint();


const drawMap = (map, container) => {


    for (let i = 0; i < map.length; i += 9) {
        let nine = document.createElement('div')
        nine.className = 'pathSpace';
        for (let j = 0; j < 9; j++) {
            let element = map[i + j];
            let unit = document.createElement('div');
            unit.className = "cellUnit"
            unit.style.backgroundColor = COLORS[element];
            unit.style.color = TEXTCOLOR[element];
            unit.innerText = ELEMENTS[element];
            nine.appendChild(unit);
        }
        nine.addEventListener('click', placeTileHere);
        container.appendChild(nine);
    }
}


/**
 * This is the main function
 * @param {*} flag determines whether dimensions are as selected or randomized.
 */
const generateMap = (width, height) => {
    //make map
    let map = new Array(width * height * 9);
    for (let i = 0; i < map.length; i++) {
        let val = Math.floor(Math.random() * 4); // Assign random values to each element
        map[i] = val;
        // console.log(`${val} => ${STATS[val]}`)
    }
    console.log('');
    let container = document.getElementById('map-space');
    container.innerHTML = ''; //clear
    // container.style.gridTemplateColumns = `repeat(${DIMENSIONS.map_w}, 1fr)`;
    // container.style.gridTemplateRows = `repeat(${DIMENSIONS.map_h}, 1fr)`;
    container.style.width = `${UNITWIDTH * DIMENSIONS.map_w}px`;
    container.style.height = `${UNITWIDTH * DIMENSIONS.map_h}px`;
    drawMap(map, container);
    moveMap(container);
    // saveButton(map);
    // saveMapToFile(map);
};

const saveButton = (map) => {
    let saveButton = document.createElement('button');
    saveButton.innerText = 'Save Map';
    saveButton.onclick = () => saveMapToFile(map);
    document.body.appendChild(saveButton);
}

const moveMap = (container) => {
    // let point = document.getElementById('point');

    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        container.style.cursor = 'grabbing';

        // // Update the red dot position (fixed at the mouse press location)
        // point.style.left = `${e.clientX - 2.5}px`;
        // point.style.top = `${e.clientY - 2.5}px`;

        const parentRect = container.parentNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        offset.x = e.clientX - (containerRect.left - parentRect.left);
        offset.y = e.clientY - (containerRect.top - parentRect.top);
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        // // Update the red dot position
        // point.style.left = `${e.clientX - 2.5}px`;
        // point.style.top = `${e.clientY - 2.5}px`;

        // Move the container based on mouse movement
        container.style.position = 'absolute';
        container.style.left = `${e.clientX - offset.x}px`;
        container.style.top = `${e.clientY - offset.y}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
};
const generateTiles = () => {
    let container = document.getElementById('placeUs');
    for (let i = 0; i < 5; i++) {
        let tile = document.createElement('div');
        tile.className = 'pathSpace';
        let pathNumber = Math.floor(Math.random() * 5);
        for (let j = 0; j < 9; j++) {
            let unit = document.createElement('div');
            unit.className = 'cellUnit';
            if (PATHS[pathNumber][j] != -1) {
                unit.innerHTML = ELEMENTS[4];
                unit.style.backgroundColor = COLORS[4]
                unit.style.color = TEXTCOLOR[4]
            } else {
                unit.style.backgroundColor = 'transparent'
            }
            tile.appendChild(unit);
        }
        tile.addEventListener('click', selectTileToPlace);
        container.appendChild(tile);
    }
}

let selectedTile;
let destinationTile;
const selectTileToPlace = (e) => {
    if ((selectedTile != undefined || (selectedTile == e.target.parentNode))) {
        selectedTile.style.opacity = '100%'
        selectedTile = undefined;
    } else {
        selectedTile = e.target.parentNode;
        selectedTile.style.opacity = '75%'
    }
}

const placeTileHere = (e) => {
    if ((destinationTile != undefined) || (destinationTile == e.target.parentNode)) {
        destinationTile.style.opacity = '100%'
        destinationTile = undefined;
        return;
    }
    destinationTile = (e.target.parentNode.id == 'placeUs') ? e.target : e.target.parentNode;
    if (selectedTile == undefined) {
        destinationTile.style.opacity = '50%'
        return;
    }
    //place
    let destinationUnits = Array.from(destinationTile.children);
    let sourceUnits = Array.from(selectedTile.children);
    for (let i = 0; i < 9; i++) {
        if (sourceUnits[i].innerHTML == ELEMENTS[4]) {
            destinationUnits[i].innerHTML = sourceUnits[i].innerHTML;
            destinationUnits[i].style.backgroundColor = sourceUnits[i].style.backgroundColor;
            destinationUnits[i].style.color = sourceUnits[i].style.color;
        }
    }
    selectedParent = selectedTile.parentNode;
    selectedParent.removeChild(selectedTile);
    selectedTile = undefined;
    if (!destinationTile.classList.contains('placed')) {
        destinationTile.classList += ' placed'
    }
    if (selectedParent.children.length == 0) {
        console.log('all tiles gone!')
        generateNewVisitor();
    }
    destinationTile = undefined;
}

const movePoint = () => {
    let container = document.getElementById('map-space');
    const point = document.getElementById('point');
    let pointisDragging = false;
    const clickNDrag = (container) => {
        container.addEventListener("mousedown", (e) => {
            pointisDragging = true;
            // Update the red dot position (fixed at the mouse press location)
            point.style.left = `${e.clientX - 2.5}px`;
            point.style.top = `${e.clientY - 2.5}px`;
            console.log(isDragging)
        });

        document.addEventListener("mousemove", (e) => {
            if (!pointisDragging) return;
            // Update the red dot position
            point.style.left = `${e.clientX - 2.5}px`;
            point.style.top = `${e.clientY - 2.5}px`;
        });

        document.addEventListener("mouseup", () => {
            pointisDragging = false;
        });
    }
}

const generateNewVisitor = () => {
    let visitorContainer = document.getElementsByClassName('visitorsContainer')[0];
    visitorContainer.append(generateRandomVisitor(Math.floor(Math.random() * 3)));
}

const generateCards = () => {
    let visitors = document.getElementsByClassName('visitorsContainer')[0].children;
    Array.from(visitors).forEach((card) => {
        console.log(card);
        card.addEventListener("click", mirrorCard)
    })
    console.log(visitors)

}

const saveMapToFile = (map) => {

    // Convert the map array to a JSON string
    const jsonString = JSON.stringify(map, null, 2); // Pretty-print with 2 spaces

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'map.json'; // Name of the file to save
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(link.href);
    console.log('saved map')
};

const gameLoop = () => {
    console.log(document.getElementById('placeUs').children.length);
    if (document.getElementById('placeUs').children.length == 0) {
        console.log(`generating new visitor...`)
        let visitorContainer = document.getElementsByClassName('visitorsContainer')[0];
        visitorContainer.appendChild(generateRandomVisitor(Math.floor(Math.random() * 3)));
    }
}

const generateRandomVisitor = (cardType) => {
    let card = document.createElement('div');
    cardType = CARDCLASS[cardType];
    card.className = `card ${cardType}`;
    card.style.backgroundColor = CARDINFO[cardType].color;

    let h = document.createElement('h4');
    h.innerHTML = CARDINFO[cardType].type;
    card.appendChild(h);

    let hearts = Math.floor(Math.random() * 4) + 1;
    let p = document.createElement('p');
    p.innerHTML = `${hearts}♡ : ${hearts}⚔︎ && ${hearts.toFixed(1)}⛊`;
    card.append(p);

    let cost = Math.floor(Math.random() * 4) + 1;
    p = document.createElement('p');
    p.innerHTML = `${cost} ${ELEMENTS[cost]} `;
    card.append(p);

    card.addEventListener('click', mirrorCard)

    return card;
};

// Show card in interact spot
const mirrorCard = (e) => {
    let card = e.target;
    if (card.parentNode.classList.contains('card')) {
        card = card.parentNode
    }
    let selected = document.getElementById('selectedCard');
    selected.innerHTML = card.innerHTML;
    selected.classList = card.classList;
    let description = document.getElementById('selectedDescription');
    let paragraph = card.querySelector('p'); // Select the first <p> element
    description.innerText = paragraph ? paragraph.innerText : "No description available";
}

window.onload = () => {
    VISIBLE = false;
    generateMap(31, 15);
    generateTiles();
    movePoint()
    console.log("generated");
    generateCards();
    gameLoop();
};